"use client";

import { useSyncExternalStore } from "react";
import { ClipboardCheck, Star } from "lucide-react";

import {
  getRewardsServerSnapshot,
  getRewardsSnapshot,
  getTestSessions,
  subscribeRewards,
} from "@/lib/rewards";

export function TestProgress({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const state = useSyncExternalStore(
    subscribeRewards,
    getRewardsSnapshot,
    getRewardsServerSnapshot
  );
  const tests = getTestSessions(state, courseId);

  if (tests.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ClipboardCheck className="size-4" aria-hidden="true" />
        {courseTitle} test not taken yet
      </span>
    );
  }

  const best = tests.reduce((a, b) =>
    b.stars > a.stars || (b.stars === a.stars && b.correct > a.correct) ? b : a
  );

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      aria-label={`Best test score ${best.correct} of ${best.total} correct, ${best.stars} stars`}
    >
      <ClipboardCheck className="size-4" aria-hidden="true" />
      Best {best.correct}/{best.total}
      <span className="inline-flex items-center gap-0.5 text-yellow-600 dark:text-yellow-400">
        <Star className="size-3.5 fill-current" aria-hidden="true" />
        {best.stars}
      </span>
    </span>
  );
}
