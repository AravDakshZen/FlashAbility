import Link from "next/link";
import {
  BookOpen,
  Calculator,
  GraduationCap,
  PawPrint,
  Speech,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";

import { CourseProgress } from "@/components/decks/course-progress";
import { DeckGrid } from "@/components/decks/deck-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAllCourses, getAllDecks, getCourseDecks } from "@/lib/decks";

const ICON_MAP: Record<string, LucideIcon> = {
  PawPrint,
  Calculator,
  Speech,
};

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Learning courses built from FlashAbility decks — animals, math, and speech & language therapy.",
};

export default function CoursesPage() {
  const courses = getAllCourses();
  const decks = getAllDecks();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Structured learning paths
          </p>
          <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Courses
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Curated lesson sequences for therapy and classroom use — pick a
            course and work through it at your own pace.
          </p>
        </header>

        <section aria-label="Course list" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const decksInCourse = getCourseDecks(course);
            const Icon = ICON_MAP[course.icon] ?? GraduationCap;
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group/course block h-full rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
                aria-label={`${course.title} course, ${decksInCourse.length} lessons`}
              >
                <Card className="h-full overflow-hidden transition-shadow duration-300 group-hover/course:shadow-lg group-hover/course:shadow-foreground/5">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground"
                        aria-hidden="true"
                      >
                        <Icon className="size-6" />
                      </span>
                      <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {decksInCourse.length} lesson
                        {decksInCourse.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <CardTitle className="mt-4 text-lg tracking-tight">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="size-4" aria-hidden="true" />
                      {decksInCourse.length} lessons
                    </span>
                    <CourseProgress deckIds={course.deckIds} />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>

        <section aria-label="Deck library" className="mt-16">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Deck Library
            </h2>
            <p className="mt-2 text-pretty text-muted-foreground">
              Browse the full flashcard library — filter by category, then tap a
              deck to learn, test, or open e-paper mode.
            </p>
          </div>
          <div className="mt-6">
            <DeckGrid decks={decks} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
