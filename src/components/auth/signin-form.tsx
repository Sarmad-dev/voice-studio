"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { signInSchema } from "@/lib/validation";
import { signInWithCredentials } from "@/actions/auth.action";

export function SignInForm() {
  return (
    <AuthForm
      formType="SIGN_IN"
      schema={signInSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmit={signInWithCredentials}
    />
  );
} 