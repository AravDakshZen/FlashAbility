"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Monitor,
  RotateCcw,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Deck } from "@/types/decks";
import { cn } from "@/lib/utils";

type PracticeSummaryProps = {
  deck: Deck;
  correctCount: number;
  total: number;
  reduceMotion: boolean;
  onRestart: () => void;
};

export function PracticeSummary({
  deck,
  correctCount,
  total,
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
          <CheckCircle2 className="mx-auto size-14 text-green-600" aria-hidden="true" />
        </motion.div>
        <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight">
          Great job, {deck.title}!
        </h1>
        <p className="mt-2 text-muted-foreground" id="summary-description">
          You got {correctCount} out of {total} correct.
        </p>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
          <Stat label="Accuracy" value={`${accuracy}%`} icon={<Check className="size-5 text-green-600" aria-hidden="true" />} />
          <Stat label="Correct" value={String(correctCount)} icon={<CheckCircle2 className="size-5 text-green-600" aria-hidden="true" />} />
          <Stat label="Cards" value={String(total)} icon={<BookOpen className="size-5 text-muted-foreground" aria-hidden="true" />} />
        </div>

        <p className="mx-auto mt-8 max-w-md text-sm text-muted-foreground">
          Practice is for learning — take the course test to earn stars, points,
          and badges.
        </p>

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
