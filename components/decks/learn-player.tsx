"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check, RotateCcw, Volume2, X } from "lucide-react";

import { PracticeCard } from "@/components/decks/practice-card";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/tts";
import { useReducedMotionSafe } from "@/lib/hooks/use-reduced-motion";
import type { Deck } from "@/types/decks";

export function LearnPlayer({ deck }: { deck: Deck }) {
  const reduceMotion = useReducedMotionSafe();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const ttsSupported = useSyncExternalStore(
    () => () => {},
    () => isTtsSupported(),
    () => false
  );

  const card = useMemo(
    () => deck.cards[index] ?? deck.cards[0],
    [deck.cards, index]
  );

  const total = deck.cards.length;

  const speakContent = useCallback((text: string) => {
    if (!isTtsSupported()) return;
    speak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, []);

  const speakCurrent = useCallback(() => {
    const textToSpeak = flipped ? (card.back ?? `This is a ${card.front}`) : card.front;
    speakContent(textToSpeak);
  }, [flipped, card.front, card.back, speakContent]);

  useEffect(() => {
    speakCurrent();
    return () => stopSpeaking();
  }, [index, flipped, speakCurrent]);

  const goNext = useCallback(() => {
    if (index < total - 1) {
      setFlipped(false);
      setIndex((i) => i + 1);
    }
  }, [index, total]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setIndex((i) => i - 1);
    }
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;

      // Space activates the focused button natively — only use it to speak
      // when focus is not on an interactive element.
      if (e.key === " ") {
        const el = e.target instanceof HTMLElement ? e.target : null;
        if (el && el.closest("button, a, input, textarea, select, [contenteditable]"))
          return;
        e.preventDefault();
        speakCurrent();
        return;
      }

      switch (e.key) {
        case "f":
        case "F":
        case "r":
        case "R":
          setFlipped((f) => !f);
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
        case "Backspace":
          e.preventDefault();
          goPrev();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speakCurrent, goNext, goPrev]);

  const progressPct = Math.round(((index + 1) / total) * 100);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/decks/${deck.id}`}
          aria-label="Exit learning"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          <X className="size-5" aria-hidden="true" />
          Exit Learning
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
          <BookOpen className="size-3.5" aria-hidden="true" />
          Learning Mode
        </span>
        <p className="text-sm font-medium">
          Card {index + 1} of {total}
        </p>
      </div>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <motion.div
          className="h-full rounded-full bg-blue-600"
          animate={{ width: `${progressPct}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col items-center justify-center">
        <PracticeCard
          card={card}
          accent={deck.accent}
          flipped={flipped}
          reduceMotion={reduceMotion}
          onFlip={() => setFlipped((f) => !f)}
          onSwipeLeft={goNext}
          onSwipeRight={goPrev}
        />

        <div className="mt-5 flex w-full max-w-md items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Previous card"
            className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:opacity-40"
          >
            <ArrowLeft className="size-6" aria-hidden="true" />
          </button>
          <p className="text-sm font-medium">
            {index + 1} / {total}
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={index >= total - 1}
            aria-label="Next card"
            className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:opacity-40"
          >
            <ArrowRight className="size-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={speakCurrent}
          aria-label={`Hear ${flipped ? "sentence" : card.front} spoken aloud`}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border bg-background px-6 text-base font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          {speaking ? (
            <span className="flex items-end gap-0.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-primary"
                  animate={reduceMotion ? {} : { height: [6, 16, 6] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </span>
          ) : (
            <Volume2 className="size-5" aria-hidden="true" />
          )}
          {speaking
            ? "Listening…"
            : ttsSupported
              ? "Listen"
              : "Audio not available"}
        </button>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border bg-background px-6 text-base font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          <RotateCcw className="size-5" aria-hidden="true" />
          Reveal
        </button>
        <Link
          href={`/decks/${deck.id}/test`}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-500"
        >
          <Check className="size-5" aria-hidden="true" />
          Ready to Test?
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Keys: Tab navigate · Space listen · R reveal · ← → previous / next · Backspace back
      </p>
    </main>
  );
}
