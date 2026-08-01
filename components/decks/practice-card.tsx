"use client";

import { motion } from "framer-motion";

import { CardVisual } from "@/components/decks/card-visual";
import type { FlashCard } from "@/types/decks";

type PracticeCardProps = {
  card: FlashCard;
  accent: string;
  flipped: boolean;
  reduceMotion: boolean;
  onFlip: () => void;
};

export function PracticeCard({
  card,
  accent,
  flipped,
  reduceMotion,
  onFlip,
}: PracticeCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={flipped ? "Show front of card" : "Show back of card"}
      className="group/card relative aspect-[4/5] [perspective:1200px] focus-visible:outline-none"
      style={{ width: "min(28rem, 100%, max(14rem, calc((100dvh - 340px) * 0.8)))" }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.45, ease: "easeInOut" }
        }
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl border bg-card p-6 text-card-foreground shadow-lg [backface-visibility:hidden]"
          style={{ borderTop: `6px solid ${accent}` }}
        >
          <CardVisual image={card.image} />
          <span className="font-heading text-5xl font-bold tracking-tight break-words text-center sm:text-6xl">
            {card.front}
          </span>
          <span className="absolute bottom-4 text-xs font-medium text-muted-foreground" aria-hidden="true">
            Tap to flip
          </span>
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border bg-muted p-6 text-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" aria-hidden="true">
            Prompt
          </span>
          <p className="text-center text-2xl font-medium break-words sm:text-3xl">
            {card.back ?? card.front}
          </p>
          <span className="absolute bottom-4 text-xs font-medium text-muted-foreground" aria-hidden="true">
            Tap to flip back
          </span>
        </div>
      </motion.div>
    </button>
  );
}
