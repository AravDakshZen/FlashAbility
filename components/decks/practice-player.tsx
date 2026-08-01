"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  RotateCcw,
  Star,
  Trophy,
  Volume2,
  X,
  Zap,
} from "lucide-react";

import { CelebrationOverlay, type Celebration } from "@/components/decks/celebration-overlay";
import { PracticeCard } from "@/components/decks/practice-card";
import { PracticeSummary } from "@/components/decks/practice-summary";
import { levelFromPoints, recordSession } from "@/lib/rewards";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/tts";
import { useReducedMotionSafe } from "@/lib/hooks/use-reduced-motion";
import type { Deck } from "@/types/decks";

type Phase = "practice" | "summary";
type Result = "correct" | "miss";
type PracticeLevel = 1 | 2 | 3;

const POINTS_CORRECT = 10;
const POINTS_STREAK_BONUS = 5;
const POINTS_COMPLETION = 25;
const POINTS_PERFECT = 50;
const STAR_EVERY = 3;

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
  const [practiceLevel, setPracticeLevel] = useState<PracticeLevel>(2);
  const [order, setOrder] = useState(() => deck.cards.map((c) => c.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [celebration, setCelebration] = useState<Celebration>(null);
  const [announcement, setAnnouncement] = useState(
    () => `Card 1 of ${deck.cards.length}. ${deck.cards[0]?.front ?? ""}`
  );
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [floatPoints, setFloatPoints] = useState<{ id: number; text: string } | null>(null);

  const summarySaved = useRef(false);
  const floatId = useRef(0);
  const prevLevel = useRef(1);

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

  const level = levelFromPoints(points);
  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r === "correct").length;
  const total = deck.cards.length;
  const isRewardDeck = deck.category === "reinforcement";

  const textToSpeak = flipped ? (card.back ?? `This is a ${card.front}`) : card.front;

  const speakWord = useCallback(() => {
    if (!isTtsSupported()) return;
    setSpeaking(true);
    speak(textToSpeak, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [textToSpeak]);

  // Speak each card as it appears — state changes only from async speech events.
  useEffect(() => {
    if (phase !== "practice") return;
    if (practiceLevel === 3 && !flipped) return;
    speak(textToSpeak, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    return () => stopSpeaking();
  }, [index, phase, textToSpeak, practiceLevel, flipped]);

  useEffect(() => {
    const lv = levelFromPoints(points).level;
    if (lv > prevLevel.current) {
      const next = { kind: "level" as const, id: Date.now() };
      setCelebration(next);
      setAnnouncement(`Level up! ${levelFromPoints(points).title}`);
      window.setTimeout(() => setCelebration((c) => (c?.id === next.id ? null : c)), 2400);
    }
    prevLevel.current = lv;
  }, [points]);

  // Null when the card was already scored — callers use it for completion tallies.
  const scoreCard = useCallback(
    (result: Result): { points: number; stars: number; streak: number } | null => {
      if (phase !== "practice" || results[card.id]) return null;

      setResults((prev) => ({ ...prev, [card.id]: result }));
      setFlipped(false);
      setSpeaking(false);
      stopSpeaking();

      let newPoints = points;
      let newStars = sessionStars;
      const newStreak = result === "correct" ? streak + 1 : 0;
      const bonus =
        result === "correct" && newStreak % STAR_EVERY === 0
          ? POINTS_STREAK_BONUS
          : 0;

      if (result === "correct") {
        setStreak(newStreak);
        newPoints += POINTS_CORRECT + bonus;

        if (newStreak % STAR_EVERY === 0) {
          newStars += 1;
          setSessionStars(newStars);
          const next = { kind: "star" as const, id: Date.now() };
          setCelebration(next);
          setAnnouncement(
            `Correct! Plus ${POINTS_CORRECT + bonus} points. Star earned!`
          );
          window.setTimeout(() => setCelebration((c) => (c?.id === next.id ? null : c)), 1800);
        } else {
          setAnnouncement(
            `Correct! Plus ${POINTS_CORRECT + bonus} points.${bonus ? " Streak bonus!" : ""}`
          );
        }

        const text =
          bonus > 0 ? `+${POINTS_CORRECT + bonus} ⚡` : `+${POINTS_CORRECT}`;
        setFloatPoints({ id: ++floatId.current, text });
        window.setTimeout(() => setFloatPoints(null), 900);

        setPoints(newPoints);
      } else {
        setStreak(0);
        setAnnouncement("Try again — you can do it!");
      }

      return { points: newPoints, stars: newStars, streak: newStreak };
    },
    [phase, results, card.id, streak, points, sessionStars]
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
    setStreak(0);
    setPoints(0);
    setSessionStars(0);
    setNewBadges([]);
    setFlipped(false);
    setPhase("practice");
  }, [deck.cards]);

  const changeLevel = useCallback((level: PracticeLevel) => {
    setPracticeLevel(level);
    summarySaved.current = false;
    setOrder(shuffle(deck.cards.map((c) => c.id)));
    setIndex(0);
    setResults({});
    setStreak(0);
    setPoints(0);
    setSessionStars(0);
    setNewBadges([]);
    setFlipped(false);
    setPhase("practice");
  }, [deck.cards]);

  const goNext = useCallback(() => {
    if (phase !== "practice") return;

    const scored = scoreCard("correct");
    const nextPoints = (scored?.points ?? points) + 0;
    const nextStars = scored?.stars ?? sessionStars;
    const finalStreak = scored?.streak ?? streak;
    const finalCorrect = correctCount + (scored ? 1 : 0);

    const nextIndex = index + 1;
    if (nextIndex >= total) {
      let completionPoints = nextPoints;
      if (finalCorrect === total) {
        completionPoints += POINTS_PERFECT;
        setAnnouncement(`Perfect session! Plus ${POINTS_PERFECT} bonus points!`);
      } else {
        completionPoints += POINTS_COMPLETION;
      }
      setPoints(completionPoints);

      window.setTimeout(() => {
        if (!summarySaved.current) {
          summarySaved.current = true;
          const { newBadges: badges } = recordSession(
            {
              deckId: deck.id,
              deckTitle: deck.title,
              correct: finalCorrect,
              total,
              stars: nextStars,
              points: completionPoints,
              date: new Date().toISOString(),
            },
            finalStreak
          );
          setNewBadges(badges.map((b) => b.label));
        }
        setPhase("summary");
      }, 700);
    } else {
      setIndex(nextIndex);
    }
  }, [phase, scoreCard, points, sessionStars, streak, correctCount, index, total, deck.id, deck.title]);

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
        case "r":
        case "R":
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
        points={points}
        sessionStars={sessionStars}
        level={level}
        newBadges={newBadges}
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
        <p className="flex min-h-11 items-center gap-1.5 rounded-full bg-yellow-100 px-4 text-sm font-bold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300" aria-label={`${sessionStars} stars earned this session`}>
          <Star className="size-4 fill-current" aria-hidden="true" />
          {sessionStars}
        </p>
      </div>

      {/* 3 Difficulty Level Selector */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/80 bg-muted/50 p-1 sm:justify-start">
        <button
          type="button"
          onClick={() => changeLevel(1)}
          aria-pressed={practiceLevel === 1}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${practiceLevel === 1 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
        >
          Easy · Hint shown
        </button>
        <button
          type="button"
          onClick={() => changeLevel(2)}
          aria-pressed={practiceLevel === 2}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${practiceLevel === 2 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
        >
          Medium · Reveal to check
        </button>
        <button
          type="button"
          onClick={() => changeLevel(3)}
          aria-pressed={practiceLevel === 3}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${practiceLevel === 3 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
        >
          Hard · Picture only
        </button>
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="inline-flex items-center gap-1.5 font-medium">
          <Trophy className="size-4 text-yellow-500" aria-hidden="true" />
          Lv {level.level} · {level.title}
        </p>
        <p className="inline-flex items-center gap-1.5 font-medium" aria-label={`${points} points`}>
          <Zap className="size-4 text-yellow-500" aria-hidden="true" />
          {points} pts
          {streak >= 2 ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" aria-label={`Streak ${streak}`}>
              <Flame className="size-3.5" aria-hidden="true" />
              {streak}
            </span>
          ) : null}
        </p>
      </div>

      {/* Card — width scales with viewport height so it fits any aspect ratio */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col items-center justify-center">
        <PracticeCard
          card={card}
          accent={deck.accent}
          flipped={flipped}
          practiceLevel={practiceLevel}
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
          Reveal
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
        Keys: Space listen · R reveal · ← → cards · T try again
      </p>

      <AnimatePresence>
        {floatPoints ? (
          <motion.p
            key={floatPoints.id}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -24, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed left-1/2 top-1/3 z-50 text-3xl font-bold text-green-600"
            aria-hidden="true"
          >
            {floatPoints.text}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <CelebrationOverlay
        celebration={celebration}
        level={level}
        isRewardDeck={isRewardDeck}
        reduceMotion={reduceMotion}
      />

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </main>
  );
}
