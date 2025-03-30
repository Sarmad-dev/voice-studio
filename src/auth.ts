import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { verifyPassword, validateEmail } from "@/lib/auth-utils";
import { AuthError, ValidationError } from "@/lib/exceptions";
import { JWT } from "next-auth/jwt";

/**
 * Set up Auth.js configuration
 */
export const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email?.split("@")[0] || "",
          emailVerified: new Date(),
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new AuthError("No credentials provided");
        }

        // For sign in, either username or email can be provided
        const { email, password } = credentials;

        if (!password) {
          throw new ValidationError("Password is required");
        }

        const emailErrors = validateEmail(email as string);
        if (emailErrors.length > 0) {
          throw new ValidationError("Invalid email", { email: emailErrors });
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: email as string },
          });

          if (!user) {
            throw new AuthError("No user found with this email");
          }

          // Get the account associated with this user for credentials provider
          const account = await prisma.account.findFirst({
            where: {
              userId: user.id,
              provider: "credentials",
            },
          });

          if (!account || !account.providerAccountId) {
            throw new AuthError("Invalid login method");
          }

          const isValid = await verifyPassword(
            password as string,
            account.providerAccountId
          );

          if (!isValid) {
            throw new AuthError("Invalid password");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            subscriptionTier: user.subscriptionTier,
            credits: user.credits,
            minutesUsed: user.minutesUsed,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          if (error instanceof Error) {
            throw new AuthError(error.message);
          }
          throw new AuthError("An error occurred during authentication");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For OAuth logins, we need to replace the OAuth ID with the database ID
        if (account.provider !== "credentials" && account.providerAccountId && user.email) {
          // Find the user in the database by email to get the correct database ID
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          if (dbUser) {
            // Use the database ID instead of the OAuth provider's ID
            return {
              ...token,
              id: dbUser.id,
              username: dbUser.username,
              subscriptionTier: dbUser.subscriptionTier,
              credits: dbUser.credits,
              minutesUsed: dbUser.minutesUsed,
            };
          }
        }
        
        // For credential logins or if we couldn't find the DB user above
        return {
          ...token,
          id: user.id,
          username: user.username,
          subscriptionTier: user.subscriptionTier || "FREE",
          credits: user.credits || 10,
          minutesUsed: user.minutesUsed || 0,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id || "";
        session.user.username = token.username || "";
        session.user.subscriptionTier = token.subscriptionTier || "FREE";
        session.user.credits = token.credits || 0;
        session.user.minutesUsed = token.minutesUsed || 0;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        // Check if this Google account already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!existingUser) {
          // Create a new user for Google sign-in
          const username = profile.email.split("@")[0];

          // Check if username exists already
          let finalUsername = username;
          let counter = 1;

          while (
            await prisma.user.findUnique({ where: { username: finalUsername } })
          ) {
            finalUsername = `${username}${counter}`;
            counter++;
          }

          // Create the user
          const newUser = await prisma.user.create({
            data: {
              name: user.name || finalUsername,
              email: profile.email,
              image: profile.picture,
              username: finalUsername,
              emailVerified: new Date(),
              subscriptionTier: "FREE",
              credits: 10,
              minutesUsed: 0,
            },
          });

          // Create the account
          await prisma.account.create({
            data: {
              userId: newUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          });
          
          // Update the user object's ID to match the database ID
          user.id = newUser.id;
        } else {
          // If user exists, check if this provider account exists
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: account.provider,
            },
          });

          if (!existingAccount) {
            // Link the new provider to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            });
          }
          
          // Set the user ID to the database ID for consistent session
          user.id = existingUser.id;
          // Also update other user properties from the database
          user.username = existingUser.username;
          user.subscriptionTier = existingUser.subscriptionTier;
          user.credits = existingUser.credits;
          user.minutesUsed = existingUser.minutesUsed;
        }
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    signOut: "/",
    error: "/signin", // Error code passed in query string as ?error=
    newUser: "/settings/profile", // New users will be directed here on first sign in
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
