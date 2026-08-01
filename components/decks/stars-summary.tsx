"use client";

import { useSyncExternalStore } from "react";
import { Star, Trophy, Zap } from "lucide-react";

import { getRewardsServerSnapshot, getRewardsSnapshot, levelFromPoints, subscribeRewards } from "@/lib/rewards";

/** Gamification summary widget for the dashboard (reads the rewards store). */
export function StarsSummary() {
  const state = useSyncExternalStore(
    subscribeRewards,
    getRewardsSnapshot,
    getRewardsServerSnapshot
  );
  const level = levelFromPoints(state.points);

  return (
    <div
      className="grid gap-3 sm:grid-cols-4"
      aria-label={`You have ${state.stars} stars, ${state.points} points, ${state.badges.length} badges, ${state.sessions.length} completed sessions`}
    >
      <div className="flex flex-col items-center gap-1 rounded-xl border p-4">
        <Star className="size-6 fill-yellow-400 text-yellow-500" aria-hidden="true" />
        <span className="text-2xl font-bold">{state.stars}</span>
        <span className="text-xs text-muted-foreground">Stars</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl border p-4">
        <Zap className="size-6 text-yellow-500" aria-hidden="true" />
        <span className="text-2xl font-bold">{state.points}</span>
        <span className="text-xs text-muted-foreground">Points</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl border p-4">
        <Trophy className="size-6 text-yellow-500" aria-hidden="true" />
        <span className="text-2xl font-bold">{level.level}</span>
        <span className="text-xs text-muted-foreground">{level.title}</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl border p-4">
        <span className="text-2xl font-bold">{state.badges.length}</span>
        <span className="text-xs text-muted-foreground">
          Badge{state.badges.length !== 1 ? "s" : ""}
        </span>
      </div>
      {state.sessions.length === 0 ? (
        <p className="sm:col-span-4 text-center text-sm text-muted-foreground">
          Complete a practice session to start earning stars and badges!
        </p>
      ) : null}
    </div>
  );
}
