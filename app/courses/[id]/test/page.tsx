import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TestPlayer } from "@/components/decks/test-player";
import { getCourseById } from "@/lib/decks";
import { buildTest } from "@/lib/tests";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return {
    title: course ? `${course.title} · Test` : "Course not found",
    description: course
      ? `Take the ${course.title} test and earn stars, points, and badges.`
      : undefined,
  };
}

export default async function CourseTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  const questions = buildTest(course);

  return <TestPlayer course={course} questions={questions} />;
}
