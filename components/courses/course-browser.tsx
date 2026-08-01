"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, BookOpen, Play, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { courses, categories, difficulties } from "@/lib/data/dashboard";
import type { Course, CourseCategory, Difficulty } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function CatalogCard({ course, index }: { course: Course; index: number }) {
  const completed = course.progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % PAGE_SIZE) * 0.05, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full">
        <CardContent className="flex flex-col gap-4">
          <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-muted">
            <BookOpen className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
          {course.enrolled ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {completed ? "Completed" : "In progress"}
                </span>
                <span className="font-medium tabular-nums">{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not enrolled yet</p>
          )}
          <Separator className="-mx-0" />
          <Button
            variant={course.enrolled ? "default" : "outline"}
            render={<Link href={`/courses/${course.slug}`} />}
            className="w-full"
          >
            {course.enrolled ? (
              completed ? (
                <CheckCircle2 data-icon="inline-start" />
              ) : (
                <Play data-icon="inline-start" />
              )
            ) : (
              <BookOpen data-icon="inline-start" />
            )}
            {course.enrolled ? (completed ? "Review" : "Continue") : "View Course"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Filterable course catalog with search, category/difficulty filters, and pagination. */
export function CourseBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CourseCategory | "All">("All");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        !q ||
        course.name.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q);
      const matchesCategory = category === "All" || course.category === category;
      const matchesDifficulty =
        difficulty === "All" || course.difficulty === difficulty;
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [query, category, difficulty]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goToPage(next: number) {
    setPage(Math.max(1, Math.min(next, pageCount)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Courses</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Browse the full library — filter by category or difficulty to find your
          next lesson.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search courses..."
            aria-label="Search courses"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <SlidersHorizontal
              className="mr-1 hidden size-4 text-muted-foreground lg:block"
              aria-hidden="true"
            />
            {(["All", ...categories] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setPage(1);
                }}
                aria-pressed={category === item}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  category === item
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <Select
            value={difficulty}
            onValueChange={(value) => {
              setDifficulty(value as Difficulty | "All");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by difficulty" className="w-36">
              <SelectValue>{difficulty === "All" ? "All levels" : difficulty}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(["All", ...difficulties] as const).map((level) => (
                <SelectItem key={level} value={level}>
                  {level === "All" ? "All levels" : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Search className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">No courses found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term or clear the filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setDifficulty("All");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((course, index) => (
            <CatalogCard key={course.slug} course={course} index={index} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(safePage - 1)}
                className={cn(safePage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
              <PaginationItem key={number}>
                <PaginationLink
                  isActive={number === safePage}
                  onClick={() => goToPage(number)}
                  className="cursor-pointer"
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(safePage + 1)}
                className={cn(
                  safePage === pageCount && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
