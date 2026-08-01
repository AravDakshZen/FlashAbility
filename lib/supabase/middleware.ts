import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, DEMO_EMAIL, DEMO_USER_ID } from "@/lib/demo";

/**
 * Refreshes the Supabase auth session for a request and returns the response
 * with updated cookies. Runs inside `proxy.ts` (Next.js 16 renamed Middleware
 * to Proxy — Node.js runtime by default).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Demo session cookie counts as signed in — no Supabase round-trip.
  if (request.cookies.get(DEMO_COOKIE)?.value === "1") {
    return {
      supabaseResponse,
      user: { id: DEMO_USER_ID, email: DEMO_EMAIL },
    };
  }

  // Without env vars there is no Supabase project — skip auth refresh so
  // every page still renders (users appear signed out).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabaseResponse, user: null };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // IMPORTANT: Do not run code between `createServerClient` and
  // `supabase.auth.getUser()` — it will cause token refresh loops.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
