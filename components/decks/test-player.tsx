"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Flame, Star, Trophy, Volume2, XCircle, Zap, X } from "lucide-react";

import { CardVisual } from "@/components/decks/card-visual";
import { CelebrationOverlay, type Celebration } from "@/components/decks/celebration-overlay";
import { TestSummary } from "@/components/decks/test-summary";
import { levelFromPoints, recordSession } from "@/lib/rewards";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/tts";
import { useReducedMotionSafe } from "@/lib/hooks/use-reduced-motion";
import type { Deck, FlashCard } from "@/types/decks";
import { decks } from "@/lib/data/decks";

type Phase = "test" | "summary";

const POINTS_CORRECT = 15;
const POINTS_STREAK_BONUS = 5;
const POINTS_COMPLETION = 30;
const POINTS_PERFECT = 60;
const STAR_EVERY = 3;

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic per seed so server and client render identical questions
// (avoids hydration mismatches with Math.random()).
function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};
const NUMBER_BY_VALUE = Object.fromEntries(
  Object.entries(NUMBER_WORDS).map(([k, v]) => [v, k])
);
function numberWord(n: number): string {
  return NUMBER_BY_VALUE[n] ?? String(n);
}

// A counting card shows a number of objects and asks "how many?". It is a card
// whose front is a number word and whose image is a set of emoji objects.
function numberFor(card: FlashCard): number | null {
  return card.front in NUMBER_WORDS && card.image?.type === "emoji"
    ? NUMBER_WORDS[card.front]
    : null;
}

interface CountAnswer {
  id: string;
  number: number;
  word: string;
}

type Question =
  | {
      mode: "standard";
      card: FlashCard;
      promptText: string;
      options: FlashCard[];
    }
  | {
      mode: "count";
      card: FlashCard;
      count: number;
      promptText: string;
      options: CountAnswer[];
    };

type TestLevel = 1 | 2 | 3;

export function TestPlayer({ deck }: { deck: Deck }) {
  const reduceMotion = useReducedMotionSafe();

  const [phase, setPhase] = useState<Phase>("test");
  const [testLevel, setTestLevel] = useState<TestLevel>(2);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [celebration, setCelebration] = useState<Celebration>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [floatPoints, setFloatPoints] = useState<{ id: number; text: string } | null>(null);

  const summarySaved = useRef(false);
  const floatId = useRef(0);
  const celebrationIdRef = useRef(0);

  const questions: Question[] = useMemo(() => {
    const distractorCount = testLevel === 1 ? 1 : 3;
    const targetCards = deck.cards.slice(0, 10);

    // Answer options stay within similar cards — never mix unrelated
    // categories. "categoryPool" is every card from decks of this category.
    const categoryPool = decks
      .filter((d) => d.category === deck.category)
      .flatMap((d) => d.cards);

    const allCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return targetCards.map((targetCard, qi) => {
      const rng = mulberry32(hashCode(`${deck.id}:${testLevel}:${qi}`));

      // Counting cards become "How many objects?" questions answered with a
      // number, e.g. show 2 cars and the options are numerals (2, 4, 7...).
      const count = numberFor(targetCard);
      if (count !== null) {
        const similar = testLevel === 3;
        const pool = allCounts.filter((n) => n !== count);
        if (similar) {
          pool.sort((a, b) => Math.abs(a - count) - Math.abs(b - count));
        }
        const distractorNumbers = seededShuffle(pool, rng)
          .slice(0, distractorCount)
          .map((n) => ({ id: `count:${n}`, number: n, word: numberWord(n) }));
        const options = seededShuffle(
          [{ id: `count:${count}`, number: count, word: numberWord(count) }, ...distractorNumbers],
          rng
        );
        return {
          mode: "count",
          card: targetCard,
          count,
          promptText: "Count the objects. How many are there?",
          options,
        };
      }

      // Colour / shape cards are only ever offered as the same visual type —
      // colour swatches with colour swatches, shapes with shapes — never mixed
      // with emoji/photo/number distractors.
      if (
        targetCard.image?.type === "colour" ||
        targetCard.image?.type === "shape"
      ) {
        const sameType = seededShuffle(
          deck.cards.filter(
            (c) =>
              c.image?.type === targetCard.image?.type && c.id !== targetCard.id
          ),
          rng
        );
        const distractorCards = sameType.slice(0, distractorCount);
        const options = seededShuffle([targetCard, ...distractorCards], rng);
        return {
          mode: "standard",
          card: targetCard,
          promptText: `Which one is the ${targetCard.front}?`,
          options,
        };
      }

      const sameDeckPool = deck.cards.filter(
        (c) => c.id !== targetCard.id && c.front !== targetCard.front
      );
      const similarPool = categoryPool.filter(
        (c) => c.id !== targetCard.id && c.front !== targetCard.front
      );

      let distractorCards: FlashCard[];
      if (testLevel === 3) {
        // Hard: closest options from the same deck, topped up within category.
        const sameDeck = seededShuffle(sameDeckPool, rng);
        const needed = distractorCount - sameDeck.length;
        const others = seededShuffle(similarPool, rng)
          .filter((c) => !sameDeck.includes(c))
          .slice(0, Math.max(0, needed));
        distractorCards = [...sameDeck, ...others].slice(0, distractorCount);
      } else {
        // Easy/medium: variety, but only within the same category.
        distractorCards = seededShuffle(similarPool, rng).slice(
          0,
          distractorCount
        );
      }

      const options = seededShuffle([targetCard, ...distractorCards], rng);
      const promptText = `Which one is the ${targetCard.front}?`;

      return { mode: "standard", card: targetCard, promptText, options };
    });
  }, [deck.cards, deck.id, deck.category, testLevel]);

  const currentQ = questions[questionIndex] ?? questions[0];
  const total = questions.length;
  const correctCount = Object.values(results).filter(Boolean).length;
  const level = levelFromPoints(points);

  const speakPrompt = useCallback(() => {
    if (!isTtsSupported()) return;
    speak(currentQ.promptText, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [currentQ.promptText]);

  useEffect(() => {
    if (phase !== "test") return;
    speakPrompt();
    return () => stopSpeaking();
  }, [questionIndex, phase, speakPrompt]);

  // Keyboard navigation: Tab works natively; arrow keys move focus between the
  // answer buttons, Space/Enter activate them, and Backspace goes back a question.
  useEffect(() => {
    function focusOption(offset: number) {
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('button[id^="test-option-"]')
      );
      if (!buttons.length) return;
      const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next =
        idx === -1 ? 0 : Math.max(0, Math.min(buttons.length - 1, idx + offset));
      buttons[next].focus();
    }

    function onKey(e: KeyboardEvent) {
      if (e.repeat || isAnswered) return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          focusOption(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          focusOption(-1);
          break;
        case "Backspace":
          if (questionIndex === 0) break;
          e.preventDefault();
          setQuestionIndex((i) => Math.max(0, i - 1));
          setSelectedOptionId(null);
          setIsAnswered(false);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnswered, questionIndex]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const isCorrect =
      currentQ.mode === "count"
        ? currentQ.options.find((o) => o.id === optionId)?.number === currentQ.count
        : optionId === currentQ.card.id;
    setResults((prev) => ({ ...prev, [currentQ.card.id]: isCorrect }));

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = newStreak % STAR_EVERY === 0 ? POINTS_STREAK_BONUS : 0;
      const earned = POINTS_CORRECT + bonus;
      const newPoints = points + earned;
      setPoints(newPoints);

      if (newStreak % STAR_EVERY === 0) {
        const newStars = sessionStars + 1;
        setSessionStars(newStars);
        const celebrationId = ++celebrationIdRef.current;
        setCelebration({ kind: "star", id: celebrationId });
        setTimeout(() => setCelebration((c) => (c?.id === celebrationId ? null : c)), 1800);
      }

      setFloatPoints({ id: ++floatId.current, text: `+${earned}` });
      setTimeout(() => setFloatPoints(null), 900);

      speak("Correct! Great job!", {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
    } else {
      setStreak(0);
      speak(
        `Incorrect. The correct answer is ${
          currentQ.mode === "count" ? currentQ.count : currentQ.card.front
        }`,
        {
          onStart: () => setSpeaking(true),
          onEnd: () => setSpeaking(false),
        }
      );
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex >= total - 1) {
      let finalPoints = points;
      if (correctCount === total) {
        finalPoints += POINTS_PERFECT;
      } else {
        finalPoints += POINTS_COMPLETION;
      }
      setPoints(finalPoints);

      if (!summarySaved.current) {
        summarySaved.current = true;
        const { newBadges: badges } = recordSession(
          {
            deckId: deck.id,
            deckTitle: deck.title,
            correct: correctCount,
            total,
            stars: sessionStars,
            points: finalPoints,
            date: new Date().toISOString(),
          },
          streak
        );
        setNewBadges(badges.map((b) => b.label));
      }
      setPhase("summary");
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    }
  };

  const restartTest = () => {
    summarySaved.current = false;
    setQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setResults({});
    setStreak(0);
    setPoints(0);
    setSessionStars(0);
    setNewBadges([]);
    setPhase("test");
  };

  if (phase === "summary") {
    return (
      <TestSummary
        deck={deck}
        correctCount={correctCount}
        total={total}
        points={points}
        sessionStars={sessionStars}
        level={level}
        newBadges={newBadges}
        reduceMotion={reduceMotion}
        onRestart={restartTest}
      />
    );
  }

  const progressPct = Math.round(((questionIndex + 1) / total) * 100);

  return (
    <main className="mx-auto flex h-dvh max-h-dvh w-full max-w-3xl flex-col overflow-hidden px-4 py-4 sm:px-6">
      {/* Header & Difficulty Selector */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <Link
          href={`/decks/${deck.id}`}
          aria-label="Exit test"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          <X className="size-5" aria-hidden="true" />
          Exit
        </Link>

        {/* 3 Difficulty Level Selector */}
        <div className="flex items-center gap-1 rounded-full border border-border/80 bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => { setTestLevel(1); setQuestionIndex(0); setIsAnswered(false); }}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${testLevel === 1 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            Easy · 2 Choices
          </button>
          <button
            type="button"
            onClick={() => { setTestLevel(2); setQuestionIndex(0); setIsAnswered(false); }}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${testLevel === 2 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            Medium · 4 Choices
          </button>
          <button
            type="button"
            onClick={() => { setTestLevel(3); setQuestionIndex(0); setIsAnswered(false); }}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${testLevel === 3 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            Hard · Similar Pictures
          </button>
        </div>

        <p className="flex min-h-11 items-center gap-1.5 rounded-full bg-yellow-100 px-4 text-sm font-bold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300">
          <Star className="size-4 fill-current" aria-hidden="true" />
          {sessionStars}
        </p>
      </div>

      {/* Progress Bar */}
      <div
        className="mt-3 h-2.5 w-full shrink-0 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={questionIndex + 1}
      >
        <motion.div
          className="h-full rounded-full bg-emerald-600"
          animate={{ width: `${progressPct}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Level & Points Bar */}
      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-2 text-sm">
        <p className="inline-flex items-center gap-1.5 font-medium">
          <Trophy className="size-4 text-yellow-500" aria-hidden="true" />
          Lv {level.level} · {level.title}
        </p>
        <p className="inline-flex items-center gap-1.5 font-medium">
          <Zap className="size-4 text-yellow-500" aria-hidden="true" />
          {points} pts
          {streak >= 2 ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
              <Flame className="size-3.5" aria-hidden="true" />
              {streak}
            </span>
          ) : null}
        </p>
      </div>

      {/* Main content: prompt + answer options + next control fill the space */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Question Prompt */}
      <div className="mt-1 flex shrink-0 flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {currentQ.promptText}
          </h2>
          <button
            type="button"
            onClick={speakPrompt}
            aria-label="Listen to prompt"
            className="inline-flex size-11 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            {speaking ? (
              <motion.span
                className="flex items-end gap-0.5"
                animate={reduceMotion ? {} : { opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                aria-hidden="true"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 rounded-full bg-primary"
                    animate={reduceMotion ? {} : { height: [6, 16, 6] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </motion.span>
            ) : (
              <Volume2 className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Question {questionIndex + 1} of {total} —{" "}
          {currentQ.mode === "count"
            ? "Tap the number that matches how many objects"
            : "Tap the correct picture below"}
        </p>
      </div>

      {/* For counting questions, show the set of objects to count */}
      {currentQ.mode === "count" ? (
        <div className="mt-2 flex min-h-16 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-b from-muted/40 to-background px-4 py-2">
          <CardVisual image={currentQ.card.image} />
        </div>
      ) : null}

      {/* Options Grid */}
      {currentQ.mode === "count" ? (
        <div className="mt-3 grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3">
          {currentQ.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === `count:${currentQ.count}`;

            let cardStyle =
              "border-2 border-border/60 bg-gradient-to-b from-card to-muted/40 hover:border-primary/60 hover:shadow-lg hover:scale-[1.02]";
            if (isAnswered) {
              if (isCorrect) {
                cardStyle =
                  "border-4 border-green-500 bg-gradient-to-b from-green-500/10 to-green-500/20 shadow-lg shadow-green-500/20 scale-[1.02]";
              } else if (isSelected) {
                cardStyle =
                  "border-4 border-red-500 bg-gradient-to-b from-red-500/10 to-red-500/20 shadow-lg shadow-red-500/20 scale-[0.98]";
              } else {
                cardStyle =
                  "border border-border/30 opacity-40 bg-card/50 scale-[0.96]";
              }
            }

            return (
              <button
                key={option.id}
                id={`test-option-${option.id}`}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.id)}
                aria-label={`Option: ${option.number}`}
                className={`relative flex min-h-0 flex-col items-center justify-center gap-1 rounded-3xl p-3 shadow-sm backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring ${cardStyle}`}
              >
                <span className="text-6xl font-black leading-none sm:text-7xl">
                  {option.number}
                </span>
                <span className="text-lg font-semibold capitalize text-muted-foreground">
                  {option.word}
                </span>

                {isAnswered && isCorrect ? (
                  <CheckCircle2 className="absolute right-3.5 top-3.5 size-8 text-green-500 drop-shadow-md animate-bounce" />
                ) : null}
                {isAnswered && isSelected && !isCorrect ? (
                  <XCircle className="absolute right-3.5 top-3.5 size-8 text-red-500 drop-shadow-md" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3">
          {currentQ.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === currentQ.card.id;

            let cardStyle =
              "border-2 border-border/60 bg-gradient-to-b from-card to-muted/40 hover:border-primary/60 hover:shadow-lg hover:scale-[1.02]";
            if (isAnswered) {
              if (isCorrect) {
                cardStyle =
                  "border-4 border-green-500 bg-gradient-to-b from-green-500/10 to-green-500/20 shadow-lg shadow-green-500/20 scale-[1.02]";
              } else if (isSelected) {
                cardStyle =
                  "border-4 border-red-500 bg-gradient-to-b from-red-500/10 to-red-500/20 shadow-lg shadow-red-500/20 scale-[0.98]";
              } else {
                cardStyle =
                  "border border-border/30 opacity-40 bg-card/50 scale-[0.96]";
              }
            }

            return (
              <button
                key={option.id}
                id={`test-option-${option.id}`}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.id)}
                aria-label={`Option: ${option.front}`}
                className={`relative flex min-h-0 flex-col items-center justify-center rounded-3xl p-3 shadow-sm backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring ${cardStyle}`}
              >
                <div className="flex min-h-0 items-center justify-center drop-shadow-sm">
                  <CardVisual image={option.image} />
                </div>

                {isAnswered && isCorrect ? (
                  <CheckCircle2 className="absolute right-3.5 top-3.5 size-8 text-green-500 drop-shadow-md animate-bounce" />
                ) : null}
                {isAnswered && isSelected && !isCorrect ? (
                  <XCircle className="absolute right-3.5 top-3.5 size-8 text-red-500 drop-shadow-md" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Next Question Control & Correct Answer Callout */}      {isAnswered ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-center gap-4"
        >
          {currentQ.mode === "count" ? (
            (() => {
              const correctId = `count:${currentQ.count}`;
              if (selectedOptionId === correctId) return null;
              return (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-6 py-3 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <span className="text-xl">💡</span>
                  <p className="text-sm font-semibold">
                    Correct Answer: <span className="underline">{currentQ.count}</span>
                  </p>
                </div>
              );
            })()
          ) : selectedOptionId !== currentQ.card.id ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-6 py-3 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
              <span className="text-xl">💡</span>
              <p className="text-sm font-semibold">
                Correct Answer: <span className="underline">{currentQ.card.front}</span> ({currentQ.card.back ?? "shown above"})
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleNextQuestion}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            {questionIndex >= total - 1 ? "Complete Test & View Results" : "Next Question"}
            <ArrowRight className="size-5" />
          </button>
        </motion.div>
      ) : null}
      </div>

      <AnimatePresence>
        {floatPoints ? (
          <motion.p
            key={floatPoints.id}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -24, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed left-1/2 top-1/3 z-50 text-3xl font-bold text-green-600"
          >
            {floatPoints.text}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <CelebrationOverlay
        celebration={celebration}
        level={level}
        isRewardDeck={deck.category === "reinforcement"}
        reduceMotion={reduceMotion}
      />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Keys: Tab navigate · ← → choose · Space select · Backspace previous question
      </p>
    </main>
  );
}
