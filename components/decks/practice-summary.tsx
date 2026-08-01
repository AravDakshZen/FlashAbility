"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Monitor,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { LevelInfo } from "@/lib/rewards";
import type { Deck } from "@/types/decks";
import { cn } from "@/lib/utils";

type PracticeSummaryProps = {
  deck: Deck;
  correctCount: number;
  total: number;
  points: number;
  sessionStars: number;
  level: LevelInfo;
  newBadges: string[];
  reduceMotion: boolean;
  onRestart: () => void;
};

export function PracticeSummary({
  deck,
  correctCount,
  total,
  points,
  sessionStars,
  level,
  newBadges,
  reduceMotion,
  onRestart,
}: PracticeSummaryProps) {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
      <div className="text-center">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <Trophy className="mx-auto size-14 text-yellow-500" aria-hidden="true" />
        </motion.div>
        <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight">
          Great job, {deck.title}!
        </h1>
        <p className="mt-2 text-muted-foreground" id="summary-description">
          You got {correctCount} out of {total} correct.
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          <Stat label="Points" value={String(points)} icon={<Zap className="size-5 text-yellow-500" aria-hidden="true" />} />
          <Stat label="Stars" value={String(sessionStars)} icon={<Star className="size-5 fill-yellow-400 text-yellow-500" aria-hidden="true" />} />
          <Stat label="Accuracy" value={`${accuracy}%`} icon={<Check className="size-5 text-green-600" aria-hidden="true" />} />
        </div>

        <div
          className="mx-auto mt-8 flex max-w-md items-center gap-4 rounded-xl border p-4"
          role="img"
          aria-label={`Level ${level.level}, ${level.title}. ${level.nextTitle ? `${level.pointsForNext} points to ${level.nextTitle}.` : "Maximum level reached!"}`}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {level.level}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-medium">{level.title}</p>
            {level.nextTitle ? (
              <>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${Math.round(level.progress * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {level.pointsForNext} points to {level.nextTitle}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Maximum level reached — incredible!
              </p>
            )}
          </div>
        </div>

        {newBadges.length > 0 ? (
          <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 dark:bg-yellow-500/10">
            <p className="flex items-center justify-center gap-2 font-medium">
              <Sparkles className="size-5 text-yellow-500" aria-hidden="true" />
              New badge{newBadges.length > 1 ? "s" : ""} earned!
            </p>
            <ul className="mt-2 flex flex-wrap justify-center gap-2">
              {newBadges.map((label) => (
                <Badge key={label} className="bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">
                  {label}
                </Badge>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRestart}
            className={cn(buttonVariants({ size: "lg" }), "min-h-12 w-full px-8 text-base sm:w-auto")}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            Practice Again
          </button>
          <Link
            href={`/decks/${deck.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-h-12 w-full px-8 text-base sm:w-auto")}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            Back to Deck
          </Link>
          <Link
            href={`/decks/${deck.id}/epaper`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-h-12 w-full px-8 text-base sm:w-auto")}
          >
            <Monitor className="size-5" aria-hidden="true" />
            E-Paper Mode
          </Link>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border p-3">
      {icon}
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
