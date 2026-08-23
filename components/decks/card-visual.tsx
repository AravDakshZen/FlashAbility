"use client";

import Image from "next/image";
import type { FlashCardImage } from "@/types/decks";
import { CardIcon } from "@/components/decks/card-icon";

const SHAPE_PATHS: Record<string, React.ReactNode> = {
  circle: <circle cx="50" cy="50" r="40" />,
  square: <rect x="15" y="15" width="70" height="70" />,
  triangle: <polygon points="50,10 90,85 10,85" />,
  rectangle: <rect x="8" y="30" width="84" height="40" />,
  star: <polygon points="50,5 61,38 95,38 67,58 77,92 50,72 23,92 33,58 5,38 39,38" />,
  heart: <path d="M50 88 C20 64 8 48 8 32 C8 18 18 8 30 8 C38 8 46 14 50 24 C54 14 62 8 70 8 C82 8 92 18 92 32 C92 48 80 64 50 88 Z" />,
  oval: <ellipse cx="50" cy="50" rx="42" ry="28" />,
  diamond: <polygon points="50,5 92,50 50,95 8,50" />,
  crescent: <path d="M62 8 A42 42 0 1 0 62 92 A34 34 0 1 1 62 8 Z" />,
  cross: <path d="M35 10 H65 V35 H90 V65 H65 V90 H35 V65 H10 V35 H35 Z" />,
};

const graphemeSplit = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;

function splitEmojis(value: string): string[] {
  if (!graphemeSplit) {
    return Array.from(value);
  }
  return [...graphemeSplit.segment(value)].map((s) => s.segment);
}

type CardSize = "sm" | "md" | "lg";

const SIZES: Record<CardSize, {
  url: string;
  numeral: string;
  shape: string;
  emojiOne: string;
  emojiMany: string;
  icon: string;
}> = {
  sm: {
    url: "size-20 sm:size-24",
    numeral: "text-5xl sm:text-6xl",
    shape: "size-20 sm:size-24",
    emojiOne: "text-5xl",
    emojiMany: "text-4xl sm:text-5xl",
    icon: "size-20 sm:size-24",
  },
  md: {
    url: "size-32 sm:size-36",
    numeral: "text-6xl sm:text-7xl",
    shape: "size-24 sm:size-28",
    emojiOne: "text-6xl",
    emojiMany: "text-4xl sm:text-5xl",
    icon: "size-24 sm:size-28",
  },
  lg: {
    url: "size-40 sm:size-48",
    numeral: "text-8xl sm:text-9xl",
    shape: "size-28 sm:size-32",
    emojiOne: "text-8xl",
    emojiMany: "text-5xl sm:text-6xl",
    icon: "size-28 sm:size-32",
  },
};

export function CardVisual({
  image,
  size = "lg",
}: {
  image?: FlashCardImage;
  size?: CardSize;
}) {
  if (!image) return null;
  const s = SIZES[size];

  switch (image.type) {
    case "url":
      return ( 
        <span className={`relative block ${s.url}`}>
          <Image
            src={image.value}
            alt=""
            fill
            loading="eager"
            sizes="192px"
            className="object-contain"
          />
        </span>
      );
    case "numeral":
      return (
        <span className={`${s.numeral} font-black leading-none`}>
          {image.value}
        </span>
      );
    case "colour":
      return (
        <span
          className={`block ${s.shape} rounded-2xl border-4 shadow-sm`}
          style={{ backgroundColor: image.value }}
          aria-hidden="true"
        />
      );
    case "shape":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${s.shape} fill-current`}
          aria-hidden="true"
        >
          {SHAPE_PATHS[image.value]}
        </svg>
      );
    case "emoji": {
      const parts = splitEmojis(image.value);
      return (
        <span className="flex max-w-full flex-wrap items-center justify-center gap-1.5 leading-none sm:gap-2" aria-hidden="true">
          {parts.map((e, i) => (
            <span key={i} className={parts.length === 1 ? s.emojiOne : s.emojiMany}>
              {e}
            </span>
          ))}
        </span>
      );
    }
    case "icon":
      return <CardIcon name={image.value} className={s.icon} />;
  }
}