"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  X,
} from "lucide-react";

import { isTtsSupported, speak, stopSpeaking } from "@/lib/tts";
import type { Deck } from "@/types/decks";

/**
 * E-paper player — strict monochrome, zero animation, zero color.
 * Built for low-power e-ink tablets (Onyx Boox and similar) where
 * colour, gradients, and motion drain battery and hurt contrast.
 * Everything is black on white, text-first, keyboard-navigable.
 */
export function EpaperPlayer({ deck }: { deck: Deck }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = deck.cards[index];

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, deck.cards.length - 1));
    setFlipped(false);
    stopSpeaking();
  }, [deck.cards.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
    setFlipped(false);
    stopSpeaking();
  }, []);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      switch (e.key) {
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case " ":
        case "f":
        case "F":
          e.preventDefault();
          flip();
          break;
        case "Escape":
          window.location.href = `/decks/${deck.id}`;
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, flip, deck.id]);

  const tts = isTtsSupported();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-white px-6 py-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <Link
          href={`/decks/${deck.id}`}
          className="flex min-h-12 items-center gap-1 border-2 border-black bg-white px-3 font-medium text-black hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-black"
        >
          <X className="size-5" aria-hidden="true" />
          Back
        </Link>
        <h1 className="text-lg font-bold">{deck.title}</h1>
        <p className="border-2 border-black px-3 py-1 text-sm font-bold">
          {index + 1} / {deck.cards.length}
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full border-2 border-black"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={deck.cards.length}
        aria-valuenow={index + 1}
        aria-label="Card progress"
      >
        <div
          className="h-full bg-black"
          style={{ width: `${((index + 1) / deck.cards.length) * 100}%` }}
        />
      </div>

      <button
        type="button"
        onClick={flip}
        aria-pressed={flipped}
        className="mt-6 flex flex-1 flex-col items-center justify-center gap-6 border-4 border-black bg-white p-6 text-center focus-visible:outline-4 focus-visible:outline-black"
      >
        {flipped ? (
          <>
            <span className="text-sm font-bold uppercase tracking-widest">
              Prompt
            </span>
            <span className="text-3xl font-bold break-words sm:text-4xl">
              {card.back ?? card.front}
            </span>
          </>
        ) : (
          <>
            <span className="text-8xl font-bold sm:text-9xl">{card.front}</span>
            <span className="text-sm font-bold uppercase tracking-widest">
              Tap to flip
            </span>
          </>
        )}
      </button>

      <div className="mt-6 flex items-stretch justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous card"
          className="flex min-h-16 min-w-16 items-center justify-center border-2 border-black bg-white text-black hover:bg-black hover:text-white focus-visible:outline-4 focus-visible:outline-black disabled:opacity-30"
        >
          <ChevronLeft className="size-8" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={flip}
          className="flex-1 border-2 border-black bg-white px-4 text-lg font-bold text-black hover:bg-black hover:text-white focus-visible:outline-4 focus-visible:outline-black"
        >
          Flip
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={index >= deck.cards.length - 1}
          aria-label="Next card"
          className="flex min-h-16 min-w-16 items-center justify-center border-2 border-black bg-white text-black hover:bg-black hover:text-white focus-visible:outline-4 focus-visible:outline-black disabled:opacity-30"
        >
          <ChevronRight className="size-8" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setFlipped(false);
          }}
          className="flex min-h-12 items-center gap-1 border-2 border-black bg-white px-3 text-sm font-bold text-black hover:bg-black hover:text-white focus-visible:outline-4 focus-visible:outline-black"
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Restart
        </button>
        {tts ? (
          <button
            type="button"
            onClick={() => speak(card.front)}
            className="flex min-h-12 items-center gap-1 border-2 border-black bg-white px-3 text-sm font-bold text-black hover:bg-black hover:text-white focus-visible:outline-4 focus-visible:outline-black"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
            Play sound
          </button>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-widest">
          Keys: ← → · Space flip
        </p>
      </div>
    </main>
  );
}
