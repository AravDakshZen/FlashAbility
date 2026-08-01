"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Play, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { courses } from "@/lib/data/dashboard";
import type { Course } from "@/lib/types/dashboard";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function CourseThumbnail() {
  return (
    <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-muted">
      <BookOpen className="size-8 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const completed = course.progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full">
        <CardContent className="flex flex-col gap-4">
          <CourseThumbnail />
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.difficulty}</Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-medium">{course.name}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {course.description}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatDuration(course.duration)}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {course.lessons.length} lessons
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completed ? "Completed" : "In progress"}
              </span>
              <span className="font-medium tabular-nums">{course.progress}%</span>
            </div>
            <Progress
              value={course.progress}
              className={completed ? "[&_[data-slot=progress-indicator]]:bg-foreground" : undefined}
            />
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="pt-(--card-spacing)">
          <Button render={<Link href={`/courses/${course.slug}`} />} className="w-full">
            {completed ? (
              <CheckCircle2 data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            {completed ? "Review Course" : "Continue Learning"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

/** First three enrolled courses with a link to the full catalog. */
export function FeaturedCourses() {
  const featured = courses.filter((course) => course.enrolled).slice(0, 3);

  return (
    <section id="courses" aria-label="Featured courses" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Featured Courses</h2>
          <p className="text-sm text-muted-foreground">
            Pick up where you left off.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/courses" />}
        >
          View All Courses
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((course, index) => (
          <CourseCard key={course.slug} course={course} index={index} />
        ))}
      </div>
      <div className="flex justify-center md:hidden">
        <Button variant="outline" size="sm" render={<Link href="/courses" />}>
          View All Courses
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>    </section>
  );
}
