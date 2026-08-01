import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/supabase/dal";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse the FlashAbility course library — speech, vocabulary, phonics, grammar, and communication.",
};

export default async function CoursesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
