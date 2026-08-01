import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/supabase/dal";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your FlashAbility learning dashboard — courses, progress, leaderboard, and achievements.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
