import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components, Server Actions and
 * Route Handlers. Reads and writes the auth session cookies.
 *
 * NOTE: Next.js 16 requires `await cookies()` — never use the synchronous
 * access pattern.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` is called from a Server Component — the cookie write
            // can only happen in a Server Action or Route Handler. Swallow
            // silently; the Proxy refreshes the session on the next request.
          }
        },
      },
    }
  );
}
