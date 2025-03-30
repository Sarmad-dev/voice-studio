"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCredentials, signUpWithCredentials } from "@/actions/auth.action";

export type SignUpData = {
  email: string;
  password: string;
  username: string;
  name?: string;
};

export type SignInData = {
  email?: string;
  password: string;
};

export type AuthError = {
  message: string;
  errors?: Record<string, string[]>;
};

export function useAuth() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  // Sign in with credentials (email/username + password)
  const signInWithEmail = async (data: SignInData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithCredentials(data)

      if (result?.error) {
        setError({ message: result.error.message });
        return false;
      }

      router.push("/dashboard");
      return true;
    } catch (err) {
      setError({ message: "An unexpected error occurred" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn("google", { callbackUrl: "/dashboard" });
      return true;
    } catch (err) {
      setError({ message: "Failed to sign in with Google" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with credentials
  const signUp = async (data: SignUpData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await signUpWithCredentials(data)

      return result;
    } catch (err) {
      setError({ message: "An unexpected error occurred during signup" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut({ callbackUrl: "/" });
      return true;
    } catch (err) {
      setError({ message: "Failed to sign out" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = status === "authenticated";

  // Refresh session
  const refreshSession = async () => {
    await update();
  };

  return {
    session,
    status,
    isAuthenticated,
    loading,
    error,
    user: session?.user,
    signIn: signInWithCredentials,
    signInWithGoogle,
    signUp,
    signOut: handleSignOut,
    refreshSession,
    clearError: () => setError(null),
  };
} 