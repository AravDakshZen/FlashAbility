import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  GraduationCap,
  Monitor,
  PawPrint,
  Play,
  Speech,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";

import { LessonProgress } from "@/components/decks/lesson-progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCourseById, getCourseDecks, getTotalCardCount } from "@/lib/decks";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  PawPrint,
  Calculator,
  Speech,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return {
    title: course ? `${course.title} · Course` : "Course not found",
    description: course?.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  const lessons = getCourseDecks(course);
  const totalCards = getTotalCardCount(lessons);
  const Icon = ICON_MAP[course.icon] ?? GraduationCap;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/courses"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All courses
        </Link>

        <header className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="h-1 bg-foreground" aria-hidden="true" />
          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span
                  className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-foreground text-background"
                  aria-hidden="true"
                >
                  <Icon className="size-7" />
                </span>
                <div>
                  <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                    {course.title}
                  </h1>
                </div>
              </div>
              <Badge variant="secondary" className="min-h-8 px-3 py-1.5">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} ·{" "}
                {totalCards} cards
              </Badge>
            </div>
            <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
              {course.description}
            </p>
          </div>
        </header>

        <section aria-label="Lessons" className="mt-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Lessons
          </h2>
          <ol className="mt-4 space-y-3">
            {lessons.map((deck, i) => (
              <li key={deck.id}>
                <Card className="overflow-hidden">
                  <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background"
                        aria-hidden="true"
                      >
                        <span className="text-sm font-bold">{i + 1}</span>
                      </span>
                      <div>
                        <CardTitle className="text-base tracking-tight">
                          {deck.title}
                        </CardTitle>
                        <CardContent className="px-0 pt-1.5 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen className="size-4" aria-hidden="true" />
                            {deck.cards.length} cards
                          </span>
                        </CardContent>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 pl-14 sm:items-end sm:pl-0">
                      <LessonProgress deckId={deck.id} />
                      <div className="flex gap-2">
                        <Link
                          href={`/decks/${deck.id}/practice`}
                          className={cn(buttonVariants({ size: "sm" }), "min-h-11")}
                        >
                          <Play className="size-4" aria-hidden="true" />
                          Practice
                        </Link>
                        <Link
                          href={`/decks/${deck.id}/epaper`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "min-h-11"
                          )}
                          aria-label={`Open ${deck.title} in e-paper mode`}
                        >
                          <Monitor className="size-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Earn stars" className="mt-10 rounded-2xl border border-dashed bg-muted/30 p-6 text-center">
          <Star className="mx-auto size-8 text-foreground" aria-hidden="true" />
          <h2 className="font-heading mt-2 text-lg font-semibold tracking-tight">
            Earn stars in every lesson
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Answer correctly 3 times in a row to earn a star. Stars and points
            add up to new levels and badges.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
