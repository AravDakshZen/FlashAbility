"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SPEECH_RATE_VALUES,
} from "@/lib/accessibility";
import { useAccessibility } from "@/providers/accessibility-provider";
import { cn } from "@/lib/utils";
import type { FlashcardDeck } from "@/components/learn/flashcard-deck";

function getSpeechVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang.startsWith("en") && v.default) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    voices[0] ??
    null;
  return preferred;
}

export function FlashcardPlayer({ deck }: { deck: FlashcardDeck }) {
  const { settings } = useAccessibility();
  const [index, setIndex] = React.useState(0);
  const [speaking, setSpeaking] = React.useState(false);
  const [direction, setDirection] = React.useState<"next" | "prev">("next");

  const card = deck.cards[index];
  const total = deck.cards.length;

  const stopSpeaking = React.useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = React.useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = SPEECH_RATE_VALUES[settings.speechRate];
      const voice = getSpeechVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [settings.speechRate]
  );

  const goTo = React.useCallback(
    (next: number, dir: "next" | "prev") => {
      if (next < 0 || next >= total) return;
      stopSpeaking();
      setDirection(dir);
      setIndex(next);
    },
    [total, stopSpeaking]
  );

  const goNext = React.useCallback(
    () => goTo(index + 1, "next"),
    [goTo, index]
  );
  const goPrev = React.useCallback(
    () => goTo(index - 1, "prev"),
    [goTo, index]
  );

  // Auto-read the card aloud when it changes (opt-in mode).
  React.useEffect(() => {
    if (settings.autoRead && card) {
      speak(`${card.title}. ${card.description}`);
    }
  }, [index, settings.autoRead, card, speak]);

  // Stop speech when the deck unmounts.
  React.useEffect(() => stopSpeaking, [stopSpeaking]);

  // Keyboard navigation: â† â†’ move between cards. preventDefault keeps the
  // page from scrolling when the user is browsing cards with arrow keys.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  const speechText = `${card.title}. ${card.description}`;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* Card */}
      <div
        role="region"
        aria-roledescription="flashcard"
        aria-label={`Card ${index + 1} of ${total}`}
        tabIndex={0}
        className="group relative w-full max-w-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Card number */}
        <p
          aria-hidden="true"
          className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm"
        >
          {index + 1} / {total}
        </p>

        {/* Slide/fade transition between cards */}
        <div
          key={card.id}
          className={cn(
            "overflow-hidden rounded-3xl bg-card text-card-foreground shadow-sm ring-1 ring-foreground/10",
            direction === "next"
              ? "animate-in fade-in-0 slide-in-from-right-4"
              : "animate-in fade-in-0 slide-in-from-left-4"
          )}
        >
          {/* Picture */}
          <div
            aria-hidden="true"
            className={cn(
              "flex aspect-[4/3] w-full items-center justify-center",
              card.tint
            )}
          >
            <span
              role="img"
              aria-label={card.title}
              className="select-none text-[7rem] leading-none drop-shadow-sm sm:text-[9rem]"
            >
              {card.picture}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center gap-2 px-6 py-7 text-center sm:px-10">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {card.title}
            </h1>
            <p className="max-w-sm text-pretty text-base text-muted-foreground sm:text-lg">
              {card.description}
            </p>

            <Button
              type="button"
              size="lg"
              className="mt-3 h-14 w-full gap-2 rounded-2xl text-base sm:w-auto sm:min-w-44"
              aria-label={
                speaking
                  ? `Stop reading ${card.title}`
                  : `Play sound for ${card.title}`
              }
              aria-pressed={speaking}
              onClick={() => {
                if (speaking) {
                  stopSpeaking();
                } else {
                  speak(speechText);
                }
              }}
            >
              {speaking ? (
                <Pause className="size-5" aria-hidden="true" />
              ) : (
                <Play className="size-5" aria-hidden="true" />
              )}
              {speaking ? "Stop" : "Play"}
            </Button>
          </div>
        </div>
      </div>

      {/* Live announcement for screen readers */}
      <p aria-live="polite" className="sr-only">
        Card {index + 1} of {total}. {card.title}. {card.description}
      </p>

      {/* Navigation */}
      <div className="flex w-full max-w-lg items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 flex-1 gap-1.5 rounded-xl sm:flex-none sm:min-w-36"
          onClick={goPrev}
          disabled={index === 0}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
          <span className="text-base">Previous</span>
        </Button>

        {/* Progress dots */}
        <div
          role="tablist"
          aria-label="Cards"
          className="hidden items-center gap-1.5 sm:flex"
        >
          {deck.cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to card ${i + 1}, ${c.title}`}
              title={`Card ${i + 1}`}
              onClick={() => goTo(i, i > index ? "next" : "prev")}
              className={cn(
                "size-2.5 rounded-full transition-all",
                i === index
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 flex-1 gap-1.5 rounded-xl sm:flex-none sm:min-w-36"
          onClick={goNext}
          disabled={index === total - 1}
        >
          <span className="text-base">Next</span>
          <ChevronRight className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
