"use client";

import Link from "next/link";
import { useEffect, useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialAuth } from "@/components/auth/social-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { signup } from "@/services/auth-service";
import type { AuthState } from "@/types/auth";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    {}
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.add({
        title: "Account created",
        description: state.message,
        type: "success",
      });
    }
  }, [state]);

  return (
    <AuthCard
      title="Create your account"
      description="Start learning with accessible, interactive flashcards."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      }
    >
      <SocialAuth />

      <div className="relative">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or sign up with email
        </span>
      </div>

      <form action={formAction} className="flex flex-col gap-5" noValidate>
        {state.errors?.form && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" aria-hidden="true" />
            <AlertDescription>{state.errors.form}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(state.errors?.email)}
              aria-describedby={state.errors?.email ? "email-error" : undefined}
            />
            <FieldError
              id="email-error"
              errors={[{ message: state.errors?.email }]}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              aria-invalid={Boolean(state.errors?.password)}
              aria-describedby={state.errors?.password ? "password-error" : undefined}
            />
            <FieldError
              id="password-error"
              errors={[{ message: state.errors?.password }]}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <FieldContent>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={Boolean(state.errors?.confirmPassword)}
              aria-describedby={
                state.errors?.confirmPassword ? "confirm-password-error" : undefined
              }
            />
            <FieldError
              id="confirm-password-error"
              errors={[{ message: state.errors?.confirmPassword }]}
            />
          </FieldContent>
        </Field>

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <Spinner />}
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
