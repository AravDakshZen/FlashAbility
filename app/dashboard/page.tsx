import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  GraduationCap,
  PawPrint,
  Play,
  Speech,
  type LucideIcon,
} from "lucide-react";

import { DeckCard } from "@/components/decks/deck-card";
import { StarsSummary } from "@/components/decks/stars-summary";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllCourses, getAllDecks, getCourseDecks } from "@/lib/decks";
import { requireUser } from "@/lib/supabase/dal";
import { logout } from "@/services/auth-service";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  PawPrint,
  Calculator,
  Speech,
};

/**
 * Classroom-style dashboard: courses with progress, the deck library,
 * and the gamification summary. Auth-protected landing after sign-in.
 */
export default async function DashboardPage() {
  const user = await requireUser();
  const courses = getAllCourses();
  const decks = getAllDecks();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="secondary" className="w-fit">
              Signed in
            </Badge>
            <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back{user.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}
            </h1>
            <p className="mt-2 text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/learn" className={cn(buttonVariants(), "min-h-11 gap-2")}>
              <Play className="size-4" aria-hidden="true" />
              Start Learning
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "outline" }), "min-h-11")}
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section aria-label="Your progress" className="mt-8">
          <StarsSummary />
        </section>

        <section aria-label="Your courses" className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              My Courses
            </h2>
            <Link
              href="/courses"
              className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium text-primary hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
            >
              Browse all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const Icon = ICON_MAP[course.icon] ?? GraduationCap;
              const lessons = getCourseDecks(course);
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
                >
                  <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div
                      className="flex h-24 items-center justify-center"
                      style={{ backgroundColor: `${course.accent}22` }}
                      aria-hidden="true"
                    >
                      <Icon className="size-10" style={{ color: course.accent }} />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-4" aria-hidden="true" />
                        {lessons.length} lessons
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-label="Deck library" className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              All Decks
            </h2>
            <Link
              href="/decks"
              className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium text-primary hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
            >
              Browse all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.slice(0, 6).map((deck) => (
              <li key={deck.id} className="h-full">
                <DeckCard deck={deck} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
