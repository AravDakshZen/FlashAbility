"use client";

import Link from "next/link";
import { useEffect, useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { resetPassword } from "@/services/auth-service";
import type { AuthState } from "@/types/auth";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    resetPassword,
    {}
  );

  useEffect(() => {
    if (state.success) {
      toast.add({
        title: "Password updated",
        description: "You can now log in with your new password.",
        type: "success",
      });
      const timer = window.setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [state]);

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a strong password you have not used before."
      footer={
        <p className="text-sm text-muted-foreground">
          Prefer to log in?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to log in
          </Link>
        </p>
      }
    >
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        {state.errors?.form && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" aria-hidden="true" />
            <AlertDescription>{state.errors.form}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
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
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
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
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
