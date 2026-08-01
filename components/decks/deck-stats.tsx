"use client";

import { useSyncExternalStore } from "react";
import { BookOpen, Eye, Star } from "lucide-react";

import { getRewardsServerSnapshot, getRewardsSnapshot, subscribeRewards } from "@/lib/rewards";

export function DeckStats({
  deckId,
  cardCount,
}: {
  deckId: string;
  cardCount: number;
}) {
  const state = useSyncExternalStore(
    subscribeRewards,
    getRewardsSnapshot,
    getRewardsServerSnapshot
  );
  const sessions = state.sessions.filter((s) => s.deckId === deckId);
  const best = sessions.length
    ? sessions.reduce((a, b) => (b.correct > a.correct ? b : a))
    : undefined;
  const viewed = best ? Math.min(best.total, cardCount) : 0;
  const stars = sessions.reduce((sum, s) => sum + s.stars, 0);

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <BookOpen className="size-4" aria-hidden="true" />
        {cardCount} cards
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Eye className="size-4" aria-hidden="true" />
        {viewed} / {cardCount} cards viewed
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Star className="size-4 fill-yellow-400 text-yellow-500" aria-hidden="true" />
        {stars} stars achieved
      </span>
    </p>
  );
}
