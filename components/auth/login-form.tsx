"use client";

import Link from "next/link";
import { useActionState } from "react";
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
import { login } from "@/services/auth-service";
import type { AuthState } from "@/types/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    {}
  );

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue your learning journey."
      footer={
        <p className="text-sm text-muted-foreground">
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <SocialAuth />

      <div className="relative">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or continue with email
        </span>
      </div>

      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <input type="hidden" name="next" value={next} />

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
            />
            <FieldError errors={[{ message: state.errors?.email }]} />
          </FieldContent>
        </Field>

        <Field>
          <div className="flex w-full items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <FieldContent>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              aria-invalid={Boolean(state.errors?.password)}
            />
            <FieldError errors={[{ message: state.errors?.password }]} />
          </FieldContent>
        </Field>

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <Spinner />}
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
