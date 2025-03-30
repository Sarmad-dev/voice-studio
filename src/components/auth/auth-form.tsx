"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../ui/alert";
import { signIn } from "next-auth/react";
import { ActionResponse } from "@/actions/auth.action";
import { Eye } from "lucide-react";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ActionResponse>;
  formType: "SIGN_IN" | "SIGN_UP";
}

export const AuthForm = <T extends FieldValues>({
  formType,
  defaultValues,
  onSubmit,
  schema,
}: AuthFormProps<T>) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    setError(null);
    setIsRateLimited(false);
  }, [formType]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    if (isRateLimited) {
      toast.error("Please wait before trying again");
      return;
    }

    setError(null);
    const result = await onSubmit(data);

    if (!result.success) {
      if (result.error?.message.includes("Too many")) {
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 60000);
      }
      
      setError(result.error?.message || "Something went wrong");
      return;
    }

    toast.success(
      formType === "SIGN_IN"
        ? "Signed in successfully"
        : "Account created successfully"
    );

    if (formType === "SIGN_UP") {
      await signIn("credentials", { 
        email: data.email, 
        password: data.password,
        redirect: false 
      });
    } else if (formType === "SIGN_IN") {
      await signIn("credentials", { 
        email: data.email, 
        password: data.password,
        redirect: false 
      });
    }
    
    router.push("/dashboard");
  };

  const handleGoogleSignIn = () => {
    if (isRateLimited) {
      toast.error("Please wait before trying again");
      return;
    }
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="grid w-full min-w-[450px] gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {Object.keys(defaultValues).map((fieldName) => {
            if (formType === "SIGN_IN" && fieldName === "confirmPassword") {
              return null;
            }
            
            return (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {fieldName === "email"
                        ? "Email Address"
                        : fieldName === "confirmPassword"
                        ? "Confirm Password"
                        : fieldName.charAt(0).toUpperCase() +
                          fieldName.slice(1)}
                    </FormLabel>
                    <FormControl>
                      <div className="min-h-[50px] min-w-full bg-accent rounded-md flex items-center gap-2">
                        <Input
                          {...field}
                          className="h-[50px] flex-1 bg-transparent focus-visible:ring-0"
                          placeholder={
                            fieldName === "email"
                              ? "johndoe@example.com"
                              : fieldName === "name"
                              ? "John Doe"
                              : fieldName === "username"
                              ? "johndoe_123"
                              : "********"
                          }
                          id={fieldName}
                          type={
                            (fieldName === "password" &&
                              showPassword.password) ||
                            (fieldName === "confirmPassword" &&
                              showPassword.confirmPassword)
                              ? "password"
                              : "text"
                          }
                          disabled={form.formState.isSubmitting || isRateLimited}
                          autoComplete={
                            fieldName === "email"
                              ? "email"
                              : fieldName === "password"
                              ? "current-password"
                              : fieldName === "confirmPassword"
                              ? "new-password"
                              : "on"
                          }
                        />
                        {fieldName === "password" ||
                        fieldName === "confirmPassword" ? (
                          <Eye
                            className="text-muted-foreground mr-2 cursor-pointer"
                            onClick={() =>
                              setShowPassword((prev) => {
                                if (fieldName === "password") {
                                  return {
                                    password: !prev.password,
                                    confirmPassword: prev.confirmPassword,
                                  };
                                } else {
                                  return {
                                    password: prev.password,
                                    confirmPassword: !prev.confirmPassword,
                                  };
                                }
                              })
                            }
                          />
                        ) : (
                          ""
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

          <Button
            disabled={form.formState.isSubmitting || isRateLimited}
            type="submit"
            className="w-full"
          >
            {form.formState.isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {formType === "SIGN_IN" ? "Sign In" : "Sign Up"}
          </Button>
          
          {isRateLimited && (
            <p className="text-xs text-center text-destructive">
              Too many attempts. Please wait before trying again.
            </p>
          )}
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={form.formState.isSubmitting || isRateLimited}
        onClick={handleGoogleSignIn}
      >
        {form.formState.isSubmitting ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
};
