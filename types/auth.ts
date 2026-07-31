import type { User } from "@supabase/supabase-js";

/**
 * Shared auth types used across server actions, forms, and providers.
 */

/** Result of an auth server action, consumed by `useActionState`. */
export type AuthState = {
  /** Field-level validation errors, keyed by form field name. */
  errors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    /** Form-level error (e.g. wrong credentials, rate limit). */
    form?: string;
  };
  /** Whether the action succeeded. `true` triggers a redirect / success UI. */
  success?: boolean;
  /** Transient message for the success toast. */
  message?: string;
};

export type AuthMode = "login" | "signup";

/** Minimal user shape exposed to client components. */
export type SessionUser = Pick<
  User,
  "id" | "email" | "email_confirmed_at" | "created_at" | "user_metadata"
>;

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials":
    "Incorrect email or password. Please try again.",
  "Email not confirmed":
    "Please confirm your email address before logging in.",
  "User already registered":
    "An account with this email already exists. Try logging in instead.",
  "Password should be at least 6 characters":
    "Password must be at least 6 characters long.",
  "For security purposes, you can only request this once every 60 seconds":
    "Please wait a minute before requesting another reset email.",
  "Signups not allowed for this instance":
    "New sign-ups are currently disabled.",
};

/** Maps a raw Supabase error message to a friendly, user-safe message. */
export function toAuthErrorMessage(raw: string): string {
  return AUTH_ERROR_MESSAGES[raw] ?? raw;
}
