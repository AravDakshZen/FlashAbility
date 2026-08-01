"use client";

import { useSyncExternalStore } from "react";

import { getRewardsServerSnapshot, getRewardsSnapshot, subscribeRewards } from "@/lib/rewards";

/** Aggregate progress across a course's lessons (reads the rewards store). */
export function CourseProgress({ deckIds }: { deckIds: string[] }) {
  const state = useSyncExternalStore(
    subscribeRewards,
    getRewardsSnapshot,
    getRewardsServerSnapshot
  );

  const perDeck = deckIds.map((deckId) => {
    const sessions = state.sessions.filter((s) => s.deckId === deckId);
    if (sessions.length === 0) return null;
    return sessions.reduce((a, b) => (b.correct > a.correct ? b : a));
  });

  const started = perDeck.filter(Boolean).length;
  const done = perDeck.filter((r) => r && r.correct >= r.total).length;
  const stars = perDeck.reduce((sum, r) => sum + (r?.stars ?? 0), 0);

  if (started === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden="true" />
        {done}/{deckIds.length} lessons · Not started
      </span>
    );
  }

  const pct = Math.round((done / deckIds.length) * 100);

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      aria-label={`${done} of ${deckIds.length} lessons completed, ${started} started, ${stars} stars earned`}
    >
      <span className="size-2 rounded-full bg-green-600" aria-hidden="true" />
      {done}/{deckIds.length} lessons · {stars}★
      <span
        className="sr-only"
        aria-hidden="true"
      >
        ({pct}% complete)
      </span>
    </span>
  );
}
