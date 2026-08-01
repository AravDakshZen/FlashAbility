"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Flame, Star, Trophy, Volume2, XCircle, Zap, X } from "lucide-react";

import { CardVisual } from "@/components/decks/card-visual";
import { CelebrationOverlay, type Celebration } from "@/components/decks/celebration-overlay";
import { PracticeSummary } from "@/components/decks/practice-summary";
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

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Question {
  card: FlashCard;
  promptText: string;
  options: FlashCard[];
}

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

  // Generate 10-question tests per level with specific question types
  const questions: Question[] = useMemo(() => {
    const allPoolCards = decks.flatMap((d) => d.cards);
    const distractorCount = testLevel === 1 ? 1 : 3;

    // Take up to 10 cards per test session
    const targetCards = deck.cards.slice(0, 10);

    return targetCards.map((targetCard) => {
      const distractorPool = allPoolCards.filter(
        (c) => c.id !== targetCard.id && c.front !== targetCard.front
      );
      const shuffledDistractors = shuffle(distractorPool).slice(0, distractorCount);
      const options = shuffle([targetCard, ...shuffledDistractors]);

      let promptText = `Which picture shows the ${targetCard.front}?`;

      if (testLevel === 1) {
        promptText = `Which one is the ${targetCard.front}?`;
      } else if (testLevel === 2) {
        if (targetCard.front.toLowerCase().includes("dog")) {
          promptText = `Which animal barks and says "Woof woof!"?`;
        } else if (targetCard.front.toLowerCase().includes("cat")) {
          promptText = `Which animal meows and says "Meow"?`;
        } else if (targetCard.front.toLowerCase().includes("cow")) {
          promptText = `Which animal moos and gives us milk?`;
        } else if (targetCard.front.toLowerCase().includes("horse")) {
          promptText = `Which animal runs fast and says "Neigh"?`;
        } else if (targetCard.front.toLowerCase().includes("sheep")) {
          promptText = `Which animal says "Baa baa" and is fluffy?`;
        } else if (targetCard.front.toLowerCase().includes("pig")) {
          promptText = `Which animal says "Oink oink" and rolls in mud?`;
        } else if (targetCard.front.toLowerCase().includes("duck")) {
          promptText = `Which bird says "Quack quack" and swims?`;
        } else if (targetCard.front.toLowerCase().includes("chicken")) {
          promptText = `Which bird says "Cluck cluck" and gives eggs?`;
        } else if (targetCard.front.toLowerCase().includes("lion")) {
          promptText = `Which big cat says "Roar" and is called the king?`;
        } else if (targetCard.front.toLowerCase().includes("elephant")) {
          promptText = `Which big animal has a long trunk?`;
        } else if (targetCard.front.toLowerCase().includes("monkey")) {
          promptText = `Which animal loves to swing and eat bananas?`;
        } else if (targetCard.front.toLowerCase().includes("frog")) {
          promptText = `Which green animal can jump high and says "Ribbit"?`;
        } else if (targetCard.front.toLowerCase().includes("bird")) {
          promptText = `Which animal can fly and sing?`;
        } else if (targetCard.front.toLowerCase().includes("fish")) {
          promptText = `Which animal swims in water?`;
        } else if (targetCard.front.toLowerCase().includes("turtle")) {
          promptText = `Which animal is slow and carries a shell?`;
        } else if (targetCard.front.toLowerCase().includes("rabbit")) {
          promptText = `Which animal hops and has long ears?`;
        } else if (targetCard.front.toLowerCase().includes("apple")) {
          promptText = `Which juicy red fruit grows on a tree?`;
        } else if (targetCard.front.toLowerCase().includes("car")) {
          promptText = `Which vehicle has 4 wheels and drives on the road?`;
        } else if (targetCard.front.toLowerCase().includes("ball")) {
          promptText = `Which round toy can you throw and bounce?`;
        } else {
          promptText = `Which picture shows the ${targetCard.front}?`;
        }
      } else if (testLevel === 3) {
        if (targetCard.front.toLowerCase().includes("cat")) {
          promptText = `Listen: find the picture of the cat that meows.`;
        } else if (targetCard.front.toLowerCase().includes("dog")) {
          promptText = `Listen: find the picture of the dog that barks.`;
        } else if (targetCard.front.toLowerCase().includes("cow")) {
          promptText = `Listen: find the picture of the cow that moos.`;
        } else {
          promptText = `Listen carefully: which picture shows the ${targetCard.front}?`;
        }
      }

      return {
        card: targetCard,
        promptText,
        options,
      };
    });
  }, [deck.cards, testLevel]);

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

  const handleSelectOption = (option: FlashCard) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    const isCorrect = option.id === currentQ.card.id;
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
      speak(`Incorrect. The correct answer is ${currentQ.card.front}`, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
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
      <PracticeSummary
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
      {/* Header & Difficulty Selector */}
      <div className="flex items-center justify-between gap-3">
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
            Simple (Identification)
          </button>
          <button
            type="button"
            onClick={() => { setTestLevel(2); setQuestionIndex(0); setIsAnswered(false); }}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${testLevel === 2 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            Medium (Action/Behavior)
          </button>
          <button
            type="button"
            onClick={() => { setTestLevel(3); setQuestionIndex(0); setIsAnswered(false); }}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${testLevel === 3 ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
          >
            Complex (Scenario)
          </button>
        </div>

        <p className="flex min-h-11 items-center gap-1.5 rounded-full bg-yellow-100 px-4 text-sm font-bold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300">
          <Star className="size-4 fill-current" aria-hidden="true" />
          {sessionStars}
        </p>
      </div>

      {/* Progress Bar */}
      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted"
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
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
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

      {/* Question Prompt */}
      <div className="mt-6 flex flex-col items-center text-center">
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
          Question {questionIndex + 1} of {total} — Tap the correct picture below
        </p>
      </div>

      {/* 4 Pictorial Options Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
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
              cardStyle = "border border-border/30 opacity-40 bg-card/50 scale-[0.96]";
            }
          }

          return (
            <button
              key={option.id}
              id={`test-option-${option.id}`}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`relative flex aspect-[4/3] flex-col items-center justify-center rounded-3xl p-5 shadow-sm backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring ${cardStyle}`}
            >
              <div className="flex size-full items-center justify-center drop-shadow-sm">
                <CardVisual image={option.image} />
              </div>
              <span className="mt-3 font-heading text-lg font-bold tracking-tight">{option.front}</span>

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

      {/* Next Question Control & Correct Answer Callout */}
      {isAnswered ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-center gap-4"
        >
          {selectedOptionId !== currentQ.card.id ? (
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
    </main>
  );
}
