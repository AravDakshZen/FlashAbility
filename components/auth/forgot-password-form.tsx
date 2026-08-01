"use client";

import Link from "next/link";
import { useEffect, useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { forgotPassword } from "@/services/auth-service";
import type { AuthState } from "@/types/auth";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    forgotPassword,
    {}
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.add({
        title: "Reset link sent",
        description: state.message,
        type: "success",
      });
    }
  }, [state]);

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email address and we will send you a link to reset it."
      footer={
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
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

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <Spinner />}
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
