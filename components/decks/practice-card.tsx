"use client";

import { AnimatePresence, motion } from "framer-motion";

import { CardVisual } from "@/components/decks/card-visual";
import type { FlashCard } from "@/types/decks";

type PracticeLevel = 1 | 2 | 3;

type PracticeCardProps = {
  card: FlashCard;
  accent: string;
  flipped: boolean;
  reduceMotion: boolean;
  onFlip: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  practiceLevel?: PracticeLevel;
};

const SWIPE_THRESHOLD = 60;

type ActionAnimation = {
  animate: Record<string, number[]>;
  transition: Record<string, number | string | number[]>;
};

// Tiny action-verb animations, played when the card is flipped in Learning mode.
const ease = "easeInOut";
const actionMotions: Record<string, ActionAnimation> = {
  jump: { animate: { y: [0, -46, 0] }, transition: { duration: 0.9, repeat: Infinity, ease } },
  run: { animate: { x: [-20, 20] }, transition: { duration: 0.55, repeat: Infinity, ease } },
  eat: { animate: { scale: [1, 1.25, 1] }, transition: { duration: 0.7, repeat: Infinity, ease } },
  drink: { animate: { rotate: [0, -12, 0, 10, 0] }, transition: { duration: 1, repeat: Infinity, ease } },
  sleep: { animate: { opacity: [1, 0.45, 1] }, transition: { duration: 1.6, repeat: Infinity, ease } },
  swim: { animate: { y: [0, -6, 0], x: [0, 10, 0] }, transition: { duration: 1, repeat: Infinity, ease } },
  clap: { animate: { x: [-4, 4, -4] }, transition: { duration: 0.35, repeat: Infinity, ease } },
  wave: { animate: { rotate: [0, -16, 16, -16, 0] }, transition: { duration: 0.8, repeat: Infinity, ease } },
  laugh: { animate: { x: [0, -6, 6, -4, 0], rotate: [0, -5, 5, -3, 0] }, transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
  cry: { animate: { y: [0, -5, 0] }, transition: { duration: 0.7, repeat: Infinity, ease } },
  dance: { animate: { rotate: [0, 9, -9, 0] }, transition: { duration: 0.8, repeat: Infinity, ease } },
  sit: { animate: { y: [0, 12, 0] }, transition: { duration: 0.9, repeat: Infinity, ease } },
  stand: { animate: { y: [0, -12, 0] }, transition: { duration: 0.9, repeat: Infinity, ease } },
  throw: { animate: { y: [0, -20, 0], rotate: [0, 30, -15, 0] }, transition: { duration: 0.9, repeat: Infinity, ease } },
  kick: { animate: { rotate: [0, -16, 0] }, transition: { duration: 0.6, repeat: Infinity, ease } },
  crawl: { animate: { x: [-16, 16] }, transition: { duration: 1.4, repeat: Infinity, ease } },
  hug: { animate: { scale: [1, 1.2, 1] }, transition: { duration: 0.8, repeat: Infinity, ease } },
  draw: { animate: { x: [-6, 6], y: [0, -4, 0] }, transition: { duration: 0.5, repeat: Infinity, ease } },
};

function actionMotion(front: string): ActionAnimation | null {
  return actionMotions[front.toLowerCase()] ?? null;
}

export function PracticeCard({
  card,
  accent,
  flipped,
  reduceMotion,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  practiceLevel = 2,
}: PracticeCardProps) {
  const hideFrontWord = practiceLevel === 3;
  const showHint = practiceLevel === 1;
  const action = actionMotion(card.front);

  return (
    <motion.div
      key={card.id}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={
        flipped
          ? `Show the word ${card.front}`
          : `Reveal the sentence for ${card.front}. Swipe left or right to change card`
      }
      onTap={onFlip}
      onKeyDown={(e) => {
        if (e.key === " ") {
          e.preventDefault();
          onFlip();
        }
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      onDragEnd={(_, info) => {
        if (info.offset.x < -SWIPE_THRESHOLD) onSwipeLeft?.();
        else if (info.offset.x > SWIPE_THRESHOLD) onSwipeRight?.();
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 220, damping: 22 }
      }
      whileTap={reduceMotion ? {} : { scale: 0.97 }}
      className="group/card relative aspect-[4/5] cursor-grab select-none touch-pan-y rounded-3xl outline-none active:cursor-grabbing focus-visible:ring-3 focus-visible:ring-ring"
      style={{ width: "min(28rem, 100%, max(14rem, calc((100dvh - 340px) * 0.8)))" }}
    >
      <div
        className="pointer-events-none absolute -inset-3 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-500 group-focus-visible/card:opacity-60"
        style={{ background: `radial-gradient(circle, ${accent}40, transparent 70%)` }}
        aria-hidden="true"
      />

      <div
        className="relative h-full w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-card via-card/95 to-muted/80 text-card-foreground shadow-2xl backdrop-blur-xl"
        style={{ borderTop: `6px solid ${accent}` }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!flipped ? (
            <motion.div
              key="front"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-between p-8"
            >
              <motion.div
                className="flex w-full items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                animate={reduceMotion ? {} : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span>FlashCard</span>
                <span className={`flex size-2.5 rounded-full bg-emerald-500 ${reduceMotion ? "" : "animate-pulse"}`} />
              </motion.div>

              <div className="my-auto flex flex-col items-center justify-center gap-6">
                <motion.div
                  animate={
                    reduceMotion
                      ? {}
                      : { y: [0, -8, 0], rotate: [0, 2, 0] }
                  }
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="drop-shadow-md"
                >
                  <CardVisual image={card.image} />
                </motion.div>

                <span className="font-heading text-center text-4xl font-bold tracking-tight sm:text-5xl">
                  {card.front}
                </span>

                {showHint ? (
                  <span className="text-center text-xl font-semibold leading-snug text-muted-foreground sm:text-2xl">
                    {card.back ?? `This is a ${card.front}`}
                  </span>
                ) : null}
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground/80">
                {hideFrontWord
                  ? "👆 Tap to reveal the word"
                  : "👆 Tap to reveal the sentence"}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-between bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 text-foreground"
            >
              <div className="flex w-full items-center justify-between text-xs font-semibold tracking-wider uppercase text-primary">
                <span>Sentence</span>
                <span className="text-xs font-mono">🔊 Spoken</span>
              </div>

              <div className="my-auto flex flex-col items-center justify-center gap-5">
                {action ? (
                  <motion.span
                    className="text-6xl sm:text-7xl"
                    aria-hidden="true"
                    animate={reduceMotion ? {} : action.animate}
                    transition={reduceMotion ? undefined : action.transition}
                  >
                    <CardVisual image={card.image} />
                  </motion.span>
                ) : (
                  <motion.span
                    className="text-4xl"
                    aria-hidden="true"
                    animate={reduceMotion ? {} : { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    💬
                  </motion.span>
                )}
                {hideFrontWord ? (
                  <span className="break-words text-center text-4xl font-black tracking-tight sm:text-5xl">
                    {card.front}
                  </span>
                ) : null}
                <p className="break-words text-balance text-center text-2xl font-bold leading-snug sm:text-3xl">
                  {card.back ?? `This is a ${card.front}`}
                </p>
              </div>

              <motion.span
                className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground/80"
                animate={reduceMotion ? {} : { y: [0, -3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                👆 Tap to show the word
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
