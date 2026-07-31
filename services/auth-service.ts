"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toAuthErrorMessage, type AuthState } from "@/types/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getOrigin(): Promise<string> {
  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const host = headerStore.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required.";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required.";
  if (password.length < 6)
    return "Password must be at least 6 characters long.";
  return undefined;
}

/** Login with email + password. On success the session cookie is set and the user is redirected. */
export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: AuthState["errors"] = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { errors: { form: toAuthErrorMessage(error.message) } };
  }

  const next = String(formData.get("next") ?? "/dashboard");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

/** Signup with email + password + confirm. Requires email confirmation unless disabled on the project. */
export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errors: AuthState["errors"] = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) {
    return { errors: { form: toAuthErrorMessage(error.message) } };
  }

  // If email confirmation is disabled, the session is created immediately.
  return {
    success: true,
    message:
      "Account created! Check your inbox to confirm your email, then log in.",
  };
}

/** Sends a password-reset email. */
export async function forgotPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  const errors: AuthState["errors"] = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getOrigin()}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { errors: { form: toAuthErrorMessage(error.message) } };
  }

  // Always succeed from the user's perspective to avoid leaking account status.
  return {
    success: true,
    message: "If that account exists, a password reset link is on its way.",
  };
}

/** Signs the user out and redirects to the landing page. */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Continues as an anonymous guest (requires "Allow anonymous sign-ins" on the Supabase project). */
export async function continueAsGuest(): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    return {
      errors: { form: "Guest access is not available right now. Please log in." },
    };
  }
  return { success: true };
}

/** Sets a new password from the recovery flow (user arrived via reset email). */
export async function resetPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errors: AuthState["errors"] = {};
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { errors: { form: toAuthErrorMessage(error.message) } };
  }

  await supabase.auth.signOut();
  return { success: true, message: "Password updated. Please log in." };
}

/** Returns the Supabase OAuth URL for Google — the client navigates to it. */
export async function signInWithGoogle(): Promise<{ url: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error || !data.url) return { url: null };
  return { url: data.url };
}
