"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Star,
  Trophy,
  Volume2,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CardVisual } from "@/components/decks/card-visual";
import {
  getRewardsServerSnapshot,
  getRewardsSnapshot,
  levelFromPoints,
  recordSession,
  subscribeRewards,
} from "@/lib/rewards";
import { isTtsSupported, speak, stopSpeaking } from "@/lib/tts";
import { useReducedMotionSafe } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/decks";
import { COUNTING_PROMPT, isCountingCard, type TestQuestion } from "@/lib/tests";

const POINTS_CORRECT = 10;
const POINTS_STREAK_BONUS = 5;
const POINTS_COMPLETION = 25;
const POINTS_PERFECT = 50;

/** Test grade: 3★ at 90%+, 2★ at 70%+, 1★ at 50%+. */
function starsForScore(correct: number, total: number): number {
  if (total === 0) return 0;
  const accuracy = correct / total;
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

const PROMPT = "Which one is this?";

function promptFor(question: TestQuestion | undefined): string {
  return question && isCountingCard(question.card) ? COUNTING_PROMPT : PROMPT;
}

export function TestPlayer({ course, questions }: { course: Course; questions: TestQuestion[] }) {
  const reduceMotion = useReducedMotionSafe();
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [phase, setPhase] = useState<"test" | "summary">("test");
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState(
    () => `Question 1 of ${total}. ${promptFor(questions[0])}`
  );
  const [speaking, setSpeaking] = useState(false);

  const summarySaved = useRef(false);

  const rewards = useSyncExternalStore(
    subscribeRewards,
    getRewardsSnapshot,
    getRewardsServerSnapshot
  );
  const level = levelFromPoints(rewards.points);

  const question = questions[index];
  const questionPrompt = promptFor(question);
  const questionVoice = question && isCountingCard(question.card) ? "counting" : "default";
  const correctCount = results.filter(Boolean).length;

  const ttsSupported = useSyncExternalStore(
    () => () => {},
    () => isTtsSupported(),
    () => false
  );

  const speakText = useCallback((text: string, voice: "default" | "counting" = "default") => {
    if (!isTtsSupported()) return;
    setSpeaking(true);
    speak(text, {
      voice,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, []);

  // Speak the prompt as each question appears — the picture is the question.
  useEffect(() => {
    if (phase !== "test" || !isTtsSupported()) return;
    speak(questionPrompt, {
      voice: questionVoice,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [index, phase, questionPrompt, questionVoice]);

  useEffect(() => () => stopSpeaking(), []);

  const handleSelect = useCallback(
    (option: string) => {
      if (answered || !question || phase !== "test") return;
      const isCorrect = option === question.card.front;
      setSelected(option);
      setAnswered(true);
      setResults((prev) => [...prev, isCorrect]);
      setAnnouncement(
        isCorrect
          ? `Correct! The answer is ${question.card.front}.`
          : `Not quite. The answer is ${question.card.front}.`
      );

      if (isCorrect) {
        const nextStreak = streak + 1;
        const bonus = nextStreak % 3 === 0 ? POINTS_STREAK_BONUS : 0;
        setStreak(nextStreak);
        setPoints((p) => p + POINTS_CORRECT + bonus);
      } else {
        setStreak(0);
      }
      speakText(question.card.front);
    },
    [answered, question, phase, streak, speakText]
  );

  const goNext = useCallback(() => {
    if (!answered || phase !== "test") return;

    const nextIndex = index + 1;
    if (nextIndex >= total) {
      const finalCorrect = correctCount;
      const finalPoints =
        points + (finalCorrect === total ? POINTS_PERFECT : POINTS_COMPLETION);
      setAnnouncement(
        finalCorrect === total ? "Perfect test! You got everything right." : "Test complete!"
      );
      window.setTimeout(() => {
        if (summarySaved.current) return;
        summarySaved.current = true;
        const { newBadges: badges } = recordSession(
          {
            kind: "test",
            deckId: `test:${course.id}`,
            deckTitle: `${course.title} Test`,
            courseId: course.id,
            correct: finalCorrect,
            total,
            stars: starsForScore(finalCorrect, total),
            points: finalPoints,
            date: new Date().toISOString(),
          },
          streak
        );
        setNewBadges(badges.map((b) => b.label));
        setPhase("summary");
      }, 500);
    } else {
      setIndex(nextIndex);
      setSelected(null);
      setAnswered(false);
      setAnnouncement(`Question ${nextIndex + 1} of ${total}. ${promptFor(questions[nextIndex])}`);
    }
  }, [answered, phase, index, total, correctCount, points, streak, course.id, course.title, questions]);

  const restart = useCallback(() => {
    summarySaved.current = false;
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setResults([]);
    setStreak(0);
    setPoints(0);
    setNewBadges([]);
    setPhase("test");
    setAnnouncement(`Question 1 of ${total}. ${promptFor(questions[0])}`);
  }, [total, questions]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (phase !== "test" || !question) return;
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= question.options.length) {
        handleSelect(question.options[num - 1]);
      } else if ((e.key === "Enter" || e.key === "ArrowRight") && answered) {
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, question, answered, handleSelect, goNext]);

  if (total === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          No test available yet
        </h1>
        <p className="mt-2 text-muted-foreground">
          This course does not have any testable content.
        </p>
        <Link
          href={`/courses/${course.id}`}
          className={cn(buttonVariants(), "mt-6 min-h-11")}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to course
        </Link>
      </main>
    );
  }

  if (phase === "summary") {
    const accuracy = Math.round((correctCount / total) * 100);
    const stars = starsForScore(correctCount, total);
    const finalPoints = points + (correctCount === total ? POINTS_PERFECT : POINTS_COMPLETION);

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
            Great job, {course.title}!
          </h1>
          <p className="mt-2 text-muted-foreground" id="test-summary-description">
            You got {correctCount} out of {total} correct in the test.
          </p>

          <div
            className="mt-6 flex items-center justify-center gap-1"
            role="img"
            aria-label={`${stars} of 3 stars earned`}
          >
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={cn(
                  "size-10",
                  n <= stars ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground/25"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {stars} of 3 stars earned
          </p>

          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
            <Stat label="Points" value={String(finalPoints)} icon={<Zap className="size-5 text-yellow-500" aria-hidden="true" />} />
            <Stat label="Stars" value={String(stars)} icon={<Star className="size-5 fill-yellow-400 text-yellow-500" aria-hidden="true" />} />
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
                <Star className="size-5 text-yellow-500" aria-hidden="true" />
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
              <Check className="size-5" aria-hidden="true" />
              Take Test Again
            </button>
            <Link
              href={`/courses/${course.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-h-12 w-full px-8 text-base sm:w-auto")}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
              Back to Course
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/courses/${course.id}`}
          aria-label="Exit test"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-5" aria-hidden="true" />
          Exit
        </Link>
        <p className="text-sm font-medium" aria-hidden="true">
          Question {index + 1} of {total}
        </p>
        <p
          className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-4 text-sm font-bold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300"
          aria-label={`${rewards.stars} stars in total`}
        >
          <Star className="size-4 fill-current" aria-hidden="true" />
          {rewards.stars}
        </p>
      </div>

      <div
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={results.length}
        aria-label="Test progress"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${Math.round((results.length / total) * 100)}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="inline-flex items-center gap-1.5 font-medium">
          <Trophy className="size-4 text-yellow-500" aria-hidden="true" />
          Lv {level.level} · {level.title}
        </p>
        <p className="inline-flex items-center gap-1.5 font-medium" aria-label={`${points} points this test`}>
          <Zap className="size-4 text-yellow-500" aria-hidden="true" />
          {points} pts
        </p>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          <p
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            id={`test-question-${index}`}
          >
            {questionPrompt}
          </p>
          <div
            className="mt-4 flex min-h-56 items-center justify-center rounded-3xl border bg-card p-6 shadow-sm"
            style={{ borderTop: `6px solid ${course.accent}` }}
          >
            <CardVisual image={question.card.image} />
          </div>
          <button
            type="button"
            onClick={() => speakText(questionPrompt, questionVoice)}
            aria-label="Hear the question"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border bg-background px-5 text-sm font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
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
              <Volume2 className="size-4" aria-hidden="true" />
            )}
            {ttsSupported ? "Listen" : "Audio not available"}
          </button>
        </div>

        <div
          className="mt-6 grid w-full max-w-md grid-cols-2 gap-3"
          role="radiogroup"
          aria-labelledby={`test-question-${index}`}
        >
          {question.options.map((option, i) => {
            const isCorrectOption = option === question.card.front;
            const isSelected = option === selected;
            const showCorrect = answered && isCorrectOption;
            const showWrong = answered && isSelected && !isCorrectOption;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={answered}
                onClick={() => handleSelect(option)}
                className={cn(
                  "inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 bg-card px-4 text-center text-lg font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                  showCorrect && "border-green-500 bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300",
                  showWrong && "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300",
                  !answered && "cursor-pointer hover:bg-muted",
                  answered && !showCorrect && !showWrong && "opacity-60"
                )}
              >
                <span className="text-sm font-bold text-muted-foreground" aria-hidden="true">
                  {i + 1}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        {answered ? (
          index >= total - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className={cn(buttonVariants({ size: "lg" }), "min-h-12 px-8")}
            >
              <Check className="size-5" aria-hidden="true" />
              Finish Test
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className={cn(buttonVariants({ size: "lg" }), "min-h-12 px-8")}
            >
              Next Question
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          )
        ) : null}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground" aria-hidden="true">
        Keys: 1–4 choose · Enter next
      </p>

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
