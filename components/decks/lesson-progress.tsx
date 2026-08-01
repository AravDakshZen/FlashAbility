"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { getRewardsServerSnapshot, getRewardsSnapshot, subscribeRewards } from "@/lib/rewards";

/** Per-lesson progress widget for course pages (reads the rewards store). */
export function LessonProgress({ deckId }: { deckId: string }) {
  const state = useSyncExternalStore(
    subscribeRewards,
    getRewardsSnapshot,
    getRewardsServerSnapshot
  );
  const sessions = state.sessions.filter((s) => s.deckId === deckId);

  if (sessions.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Circle className="size-4" aria-hidden="true" />
        Not started
      </span>
    );
  }

  const best = sessions.reduce((a, b) => (b.correct > a.correct ? b : a));
  const done = best.correct >= best.total;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${done ? "text-green-600" : "text-muted-foreground"}`}
      aria-label={`Best score ${best.correct} of ${best.total} correct, ${best.stars} stars`}
    >
      <CheckCircle2 className="size-4" aria-hidden="true" />
      {best.correct}/{best.total} · {best.stars}★
    </span>
  );
}
