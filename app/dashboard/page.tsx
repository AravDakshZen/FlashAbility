import { Greeting } from "@/components/dashboard/greeting";
import { StatsGrid } from "@/components/dashboard/stats";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Achievements } from "@/components/dashboard/achievements";
import { FeaturedCourses } from "@/components/dashboard/featured-courses";
import { HelpSection, SettingsSection } from "@/components/dashboard/settings-help";
import { requireUser } from "@/lib/supabase/dal";

/**
 * FlashAbility learning dashboard.
 * Server-rendered shell; interactive panels hydrate as client components.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <Greeting user={user} />
      <StatsGrid />
      <FeaturedCourses />
      <ProgressOverview />
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Leaderboard />
        <Achievements />
      </div>
      <SettingsSection />
      <HelpSection />
    </div>
  );
}
