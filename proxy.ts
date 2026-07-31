import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require an authenticated session.
const PROTECTED_ROUTES = ["/dashboard"];

// Routes that authenticated users should be redirected away from.
// `/reset-password` is intentionally absent — the recovery email link
// arrives with an authenticated session and must not bounce the user.
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

/**
 * Next.js 16 Proxy (formerly Middleware).
 * Optimistic auth check: refreshes the session cookie and redirects based on
 * the route. Secure checks still happen in Server Components / Server Actions
 * via the Data Access Layer.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth checks on routes we care about.
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next({ request });
  }

  const { supabaseResponse, user } = await updateSession(request);

  // Unauthenticated → protected route: send to login.
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated → auth route: send to dashboard.
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // Run on every route except static assets, images, and metadata files.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
