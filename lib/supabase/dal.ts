import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  DEMO_COOKIE,
  DEMO_EMAIL,
  DEMO_USER_ID,
  DEMO_USER_NAME,
} from "@/lib/demo";
import type { SessionUser } from "@/types/auth";

const DEMO_USER: SessionUser = {
  id: DEMO_USER_ID,
  email: DEMO_EMAIL,
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  user_metadata: { name: DEMO_USER_NAME },
};

/**
 * Data Access Layer — the secure auth check for Server Components, Server
 * Actions, and Route Handlers. `cache()` memoizes the result per request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  if (cookieStore.get(DEMO_COOKIE)?.value === "1") {
    return DEMO_USER;
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
    created_at: user.created_at,
    user_metadata: user.user_metadata,
  };
});

export const requireUser = cache(async (): Promise<SessionUser> => {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
});
