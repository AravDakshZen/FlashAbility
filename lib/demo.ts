/**
 * Built-in demo account — lets testers sign in without touching Supabase.
 * Demo login never contacts the Supabase API; it sets a local demo cookie
 * that the auth stack treats as a signed-in session.
 */

export const DEMO_EMAIL = "recc@gmail.com";
export const DEMO_PASSWORD = "password";
export const DEMO_COOKIE = "eflash_demo";
export const DEMO_USER_ID = "demo-user";
export const DEMO_USER_NAME = "Demo Learner";

export function isDemoCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
  );
}
