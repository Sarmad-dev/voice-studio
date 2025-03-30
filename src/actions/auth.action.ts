"use server";

import {
  SignInInput,
  signInSchema,
  SignUpInput,
  signUpSchema,
} from "@/lib/validation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { RateLimitError } from "@/lib/exceptions";
import { headers } from "next/headers";

export interface ActionResponse {
  success: boolean;
  error?: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

/**
 * Get a unique identifier for rate limiting
 * Use IP address + user agent to identify unique clients
 */
async function getRateLimitIdentifier(): Promise<string> {
  const headersList = headers();
  const ip = (await headersList).get("x-forwarded-for") || "unknown";
  const userAgent = (await headersList).get("user-agent") || "unknown";

  // Using portions of the user agent to avoid too specific identifiers
  const userAgentHash = userAgent.slice(0, 20);

  return `${ip}:${userAgentHash}`;
}

export async function signInWithCredentials(
  data: SignInInput
): Promise<ActionResponse> {
  const identifier = await getRateLimitIdentifier();

  try {
    // Apply rate limiting
    await rateLimit(
      identifier,
      "auth",
      "Too many sign in attempts. Please try again later."
    );

    // Validation
    const validatedFields = await signInSchema.safeParseAsync(data);
    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          message: "Enter valid email and password",
        },
      };
    }

    const { email, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Apply stricter rate limiting for failed attempts (to prevent email enumeration)
      await rateLimit(
        identifier,
        "failedAuth",
        "Too many failed sign in attempts. Please try again later."
      );

      return {
        success: false,
        error: {
          message: "Invalid email or password",
        },
      };
    }

    // Find the credentials account for this user
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: "credentials",
      },
    });

    if (!account || !account.providerAccountId) {
      // Apply stricter rate limiting for failed attempts
      await rateLimit(
        identifier,
        "failedAuth",
        "Too many failed sign in attempts. Please try again later."
      );

      return {
        success: false,
        error: {
          message: "Invalid email or password",
        },
      };
    }

    // Verify password against the hash stored in providerAccountId
    const isValidPassword = await verifyPassword(
      password,
      account.providerAccountId
    );

    if (!isValidPassword) {
      // Apply stricter rate limiting for failed attempts
      await rateLimit(
        identifier,
        "failedAuth",
        "Too many failed sign in attempts. Please try again later."
      );

      return {
        success: false,
        error: {
          message: "Invalid email or password",
        },
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    if (error instanceof RateLimitError) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        message: error.message || "Failed to sign in",
      },
    };
  }
}

export async function signUpWithCredentials(
  data: SignUpInput
): Promise<ActionResponse> {
  const identifier = await getRateLimitIdentifier();

  try {
    // Apply rate limiting
    await rateLimit(
      identifier,
      "auth",
      "Too many sign up attempts. Please try again later."
    );

    const validatedFields = await signUpSchema.safeParseAsync(data);
    if (!validatedFields.success) {
      return {
        success: false,
        error: {
          message: "Enter valid email and password and username",
        },
      };
    }

    const { email, username, password, name } = validatedFields.data;

    // Check if email exists
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      // Don't reveal that the email is registered to prevent user enumeration
      // But still rate limit to prevent scanning
      await rateLimit(identifier, "failedAuth");

      return {
        success: false,
        error: {
          message: "Email already in use",
          errors: {
            email: ["Email is already registered"],
          },
        },
      };
    }

    // Check if username exists
    const usernameExists = await prisma.user.findUnique({
      where: { username },
    });

    if (usernameExists) {
      return {
        success: false,
        error: {
          message: "Username already taken",
          errors: {
            username: ["Username is already taken"],
          },
        },
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: name || username,
        subscriptionTier: "FREE",
        credits: 10,
        minutesUsed: 0,
      },
    });

    // Create credentials account
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: hashedPassword,
      },
    });

    return { success: true };
  } catch (error: any) {
    if (error instanceof RateLimitError) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        message: error.message || "Failed to create account",
      },
    };
  }
}
