"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { LevelInfo } from "@/lib/rewards";

export type Celebration = { kind: "star" | "level"; id: number } | null;

type CelebrationOverlayProps = {
  celebration: Celebration;
  level: LevelInfo;
  isRewardDeck: boolean;
  reduceMotion: boolean;
};

export function CelebrationOverlay({
  celebration,
  level,
  isRewardDeck,
  reduceMotion,
}: CelebrationOverlayProps) {
  return (
    <AnimatePresence>
      {celebration ? (
        <div
          key={celebration.id}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          role="status"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex flex-col items-center gap-3 rounded-3xl border-4 border-yellow-400 bg-white p-10 text-center shadow-2xl dark:bg-zinc-900"
          >
            <div className="relative flex items-center justify-center" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl text-yellow-400"
                  initial={reduceMotion ? { x: 0, y: 0, opacity: 0.9 } : { x: 0, y: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    x: Math.cos((i / 6) * Math.PI * 2) * 90,
                    y: Math.sin((i / 6) * Math.PI * 2) * 90,
                    opacity: [0, 1, 0.8, 0],
                    rotate: [0, 180],
                  }}
                  transition={{ duration: 1.2, delay: 0.15 }}
                >
                  ⭐
                </motion.span>
              ))}
              <motion.span
                initial={reduceMotion ? { scale: 1 } : { scale: 0.5, rotate: -20 }}
                animate={{ scale: [0.5, 1.25, 1], rotate: [0, 360] }}
                transition={{ duration: 0.7 }}
                className="text-6xl"
              >
                {celebration.kind === "star" ? "⭐" : "🏆"}
              </motion.span>
            </div>
            <p className="text-2xl font-bold">
              {celebration.kind === "star"
                ? isRewardDeck
                  ? "Reward earned!"
                  : "Star earned!"
                : `Level ${level.level} — ${level.title}!`}
            </p>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
