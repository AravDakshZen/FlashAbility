import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  Lock,
  Target,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courses, getCourseBySlug } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function RelatedCourseCard({ slug }: { slug: string }) {
  const course = getCourseBySlug(slug);
  if (!course) return null;
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:bg-muted"
    >
      <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-muted">
        <BookOpen className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium group-hover:underline">
          {course.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {course.category} · {course.difficulty} · {course.lessons.length} lessons
        </span>
      </div>
    </Link>
  );
}

/**
 * Course detail page: banner, objectives, lesson list, resources, related courses.
 * Route param is the course slug (hyphenated name).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ "course-name": string }>;
}): Promise<Metadata> {
  const { "course-name": courseName } = await params;
  const course = getCourseBySlug(courseName);

  if (!course) {
    return { title: "Course not found" };
  }

  return {
    title: course.name,
    description: course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ "course-name": string }>;
}) {
  const { "course-name": courseName } = await params;
  const course = getCourseBySlug(courseName);

  if (!course) notFound();

  const completedLessons = course.lessons.filter((lesson) => lesson.completed).length;
  const nextLesson = course.lessons.find((lesson) => !lesson.completed && !lesson.locked);
  const related = courses
    .filter((c) => c.slug !== course.slug && c.category === course.category)
    .slice(0, 3);
  const relatedSlugs = related.length > 0 ? related : courses.filter((c) => c.slug !== course.slug).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/courses" />}>Courses</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-foreground text-background">
          <div className="flex aspect-[16/9] items-center justify-center sm:aspect-[21/9]">
            <BookOpen className="size-16 opacity-20" aria-hidden="true" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-background text-foreground">{course.difficulty}</Badge>
              <Badge variant="outline" className="border-background/40 text-background">
                {course.category}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {course.name}
            </h1>
            <p className="max-w-2xl text-sm text-background/80 sm:text-base">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-background/80">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {formatDuration(course.duration)}
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="size-3.5" aria-hidden="true" />
                {course.lessons.length} lessons
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {completedLessons} completed
              </span>
            </div>
            <div className="mt-2 flex w-full max-w-md items-center gap-3">
              <Progress
                value={course.progress}
                className="[&_[data-slot=progress-track]]:bg-background/30 [&_[data-slot=progress-indicator]]:bg-background"
              />
              <span className="text-sm font-medium tabular-nums">{course.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Lessons */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="flex flex-col gap-4" aria-label="Course lessons">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Lessons</h2>
              {nextLesson && !course.completed && (
                <Button
                  size="sm"
                  render={<Link href={`/courses/${course.slug}#${nextLesson.id}`} />}
                >
                  <Play data-icon="inline-start" />
                  Continue: {nextLesson.title}
                </Button>
              )}
            </div>
            <ol className="flex flex-col gap-2">
              {course.lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4",
                      lesson.locked && "opacity-60",
                      lesson.completed && "border-foreground/20 bg-muted/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums",
                        lesson.completed
                          ? "bg-foreground text-background"
                          : lesson.locked
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted text-foreground"
                      )}
                    >
                      {lesson.completed ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : lesson.locked ? (
                        <Lock className="size-4" aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">
                        {lesson.title}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" aria-hidden="true" />
                        {lesson.minutes} min
                      </span>
                    </div>
                    <div className="hidden w-24 items-center gap-2 sm:flex">
                      <Progress value={lesson.progress} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Separator />

          {/* Resources */}
          <section className="flex flex-col gap-4" aria-label="Course resources">
            <h2 className="text-lg font-semibold tracking-tight">Resources</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: "Printable flashcards", count: "24 cards" },
                { label: "Practice worksheets", count: "12 sheets" },
                { label: "Audio prompts", count: "18 clips" },
                { label: "Caregiver guide", count: "1 PDF" },
              ].map((resource) => (
                <div
                  key={resource.label}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{resource.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {resource.count}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" render={<Link href="/dashboard#help" />}>
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: objectives + related */}
        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="size-4" aria-hidden="true" />
                What you will learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {course.lessons.slice(0, 5).map((lesson) => (
                  <li key={lesson.id} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {relatedSlugs.map((course) => (
                  <RelatedCourseCard key={course.slug} slug={course.slug} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" render={<Link href="/courses" />}>
            <ArrowLeft data-icon="inline-start" />
            Back to all courses
          </Button>
        </aside>
      </div>
    </div>
  );
}
