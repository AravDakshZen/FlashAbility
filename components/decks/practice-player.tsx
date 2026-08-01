"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Monitor,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
  Zap,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardVisual } from "@/components/decks/card-visual";
import {
  levelFromPoints,
  recordSession,
} from "@/lib/rewards";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/tts";
import { useReducedMotionSafe } from "@/lib/hooks/use-reduced-motion";
import type { Deck } from "@/types/decks";
import { cn } from "@/lib/utils";

type Phase = "practice" | "summary";
type Result = "correct" | "miss";
type Celebration = { kind: "star" | "level"; id: number } | null;

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
              onClick={restart}
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
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={flipped ? "Show front of card" : "Show back of card"}
          className="group/card relative aspect-[4/5] [perspective:1200px] focus-visible:outline-none"
          style={{ width: "min(28rem, 100%, max(14rem, calc((100dvh - 340px) * 0.8)))" }}
        >
          <motion.div
            className="relative h-full w-full [transform-style:preserve-3d]"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.45, ease: "easeInOut" }
            }
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl border bg-card p-6 text-card-foreground shadow-lg [backface-visibility:hidden]"
              style={{ borderTop: `6px solid ${deck.accent}` }}
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

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
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
