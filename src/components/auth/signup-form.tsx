"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { signUpSchema } from "@/lib/validation";
import { signUpWithCredentials } from "@/actions/auth.action";

export function SignUpForm() {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={signUpSchema}
      defaultValues={{
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      }}
      onSubmit={signUpWithCredentials}
    />
  );
} 