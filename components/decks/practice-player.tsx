"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";

import { PracticeCard } from "@/components/decks/practice-card";
import { PracticeSummary } from "@/components/decks/practice-summary";
import { recordSession } from "@/lib/rewards";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/tts";
import { useReducedMotionSafe } from "@/lib/hooks/use-reduced-motion";
import type { Deck } from "@/types/decks";

type Phase = "practice" | "summary";
type Result = "correct" | "miss";

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function PracticePlayer({ deck }: { deck: Deck }) {
  const reduceMotion = useReducedMotionSafe();

  const [phase, setPhase] = useState<Phase>("practice");
  const [order, setOrder] = useState(() => deck.cards.map((c) => c.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [speaking, setSpeaking] = useState(false);
  const [announcement, setAnnouncement] = useState(
    () => `Card 1 of ${deck.cards.length}. ${deck.cards[0]?.front ?? ""}`
  );

  const summarySaved = useRef(false);

  // Deferred to the client: `isTtsSupported()` reads `typeof window`, which is
  // false during SSR — branching on it in the first render would mismatch.
  const ttsSupported = useSyncExternalStore(
    () => () => {},
    () => isTtsSupported(),
    () => false
  );

  const card = useMemo(
    () => deck.cards.find((c) => c.id === order[index]) ?? deck.cards[0],
    [deck.cards, order, index]
  );

  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r === "correct").length;
  const total = deck.cards.length;

  const speakWord = useCallback(() => {
    if (!isTtsSupported()) return;
    setSpeaking(true);
    speak(card.front, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [card.front]);

  // Speak each card as it appears — state changes only from async speech events.
  useEffect(() => {
    if (phase !== "practice") return;
    speak(card.front, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    return () => stopSpeaking();
  }, [index, phase, card.front]);

  // Returns true when the card was scored this call (false when already scored).
  const scoreCard = useCallback(
    (result: Result): boolean => {
      if (phase !== "practice" || results[card.id]) return false;

      setResults((prev) => ({ ...prev, [card.id]: result }));
      setFlipped(false);
      setSpeaking(false);
      stopSpeaking();
      setAnnouncement(
        result === "correct" ? `Correct! ${card.front}.` : "Try again — you can do it!"
      );
      return true;
    },
    [phase, results, card.id, card.front]
  );

  const tryAgain = useCallback(() => {
    scoreCard("miss");
    speakWord();
  }, [scoreCard, speakWord]);

  const restart = useCallback(() => {
    summarySaved.current = false;
    setOrder(shuffle(deck.cards.map((c) => c.id)));
    setIndex(0);
    setResults({});
    setFlipped(false);
    setPhase("practice");
  }, [deck.cards]);

  const goNext = useCallback(() => {
    if (phase !== "practice") return;

    const newlyScored = scoreCard("correct");
    const finalCorrect = correctCount + (newlyScored ? 1 : 0);

    const nextIndex = index + 1;
    if (nextIndex >= total) {
      window.setTimeout(() => {
        if (!summarySaved.current) {
          summarySaved.current = true;
          // Lessons are pure learning — progress only, no rewards.
          recordSession(
            {
              kind: "lesson",
              deckId: deck.id,
              deckTitle: deck.title,
              correct: finalCorrect,
              total,
              stars: 0,
              points: 0,
              date: new Date().toISOString(),
            },
            0
          );
        }
        setPhase("summary");
      }, 700);
    } else {
      setIndex(nextIndex);
    }
  }, [phase, scoreCard, correctCount, index, total, deck.id, deck.title]);

  const goPrev = useCallback(() => {
    if (phase !== "practice" || index <= 0) return;
    setFlipped(false);
    setIndex((i) => i - 1);
  }, [phase, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (phase !== "practice") return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          speakWord();
          break;
        case "f":
        case "F":
          setFlipped((f) => !f);
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "t":
        case "T":
          tryAgain();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, speakWord, goNext, goPrev, tryAgain]);

  const progressPct = Math.round((answeredCount / total) * 100);

  if (phase === "summary") {
    return (
      <PracticeSummary
        deck={deck}
        correctCount={correctCount}
        total={total}
        reduceMotion={reduceMotion}
        onRestart={restart}
      />
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/decks/${deck.id}`}
          aria-label="Exit practice"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-5" aria-hidden="true" />
          Exit
        </Link>
        <p className="text-sm font-medium" aria-hidden="true">
          Card {index + 1} of {total}
        </p>
        <span className="inline-flex min-h-11 items-center rounded-full bg-muted px-4 text-sm font-medium text-muted-foreground">
          Learning
        </span>
      </div>

      <div
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
        aria-label="Session progress"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${progressPct}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Card — width scales with viewport height so it fits any aspect ratio */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col items-center justify-center">
        <PracticeCard
          card={card}
          accent={deck.accent}
          flipped={flipped}
          reduceMotion={reduceMotion}
          onFlip={() => setFlipped((f) => !f)}
        />

        <div className="mt-5 flex w-full max-w-md items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Previous card"
            className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-muted disabled:opacity-40 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft className="size-6" aria-hidden="true" />
          </button>
          <p className="text-sm font-medium" aria-hidden="true">
            Card {index + 1} of {total}
          </p>
          {index >= total - 1 ? (
            <button
              type="button"
              onClick={goNext}
              aria-label="Finish practice"
              className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Check className="size-6" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              aria-label="Next card"
              className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowRight className="size-6" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={speakWord}
          aria-label={`Hear the word ${card.front} spoken aloud`}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border bg-background px-6 text-base font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
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
          {ttsSupported ? "Listen" : "Audio not available"}
        </button>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border bg-background px-6 text-base font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
        >
          <RotateCcw className="size-5" aria-hidden="true" />
          Flip
        </button>

        {/* Single Try Again — marks the card as not-yet-mastered and re-speaks */}
        <button
          type="button"
          onClick={tryAgain}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-400 px-8 text-base font-semibold text-amber-950 shadow-sm transition-colors hover:bg-amber-500 focus-visible:ring-3 focus-visible:ring-amber-400/50 focus-visible:outline-none"
        >
          <RotateCcw className="size-5" aria-hidden="true" />
          Try Again
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground" aria-hidden="true">
        Keys: Space listen · F flip · ← → cards · T try again
      </p>

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </main>
  );
}
