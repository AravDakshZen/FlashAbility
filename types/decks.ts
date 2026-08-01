/**
 * Deck & course models for e-Flash Cards.
 *
 * Content lives in code (`lib/data/decks.ts`) so it can be updated and
 * re-deployed without any backend — exactly what the "easy updating and
 * distribution across centres" requirement needs.
 */

export type DeckCategory =
  | "articulation"
  | "phonology"
  | "vocabulary"
  | "grammar"
  | "language"
  | "math"
  | "reinforcement";

export type FlashCardImage =
  | { type: "emoji"; value: string }
  | { type: "url"; value: string }
  | { type: "numeral"; value: string }
  | { type: "colour"; value: string }
  | { type: "shape"; value: ShapeName };

export type ShapeName =
  | "circle"
  | "square"
  | "triangle"
  | "rectangle"
  | "star"
  | "heart"
  | "oval"
  | "diamond"
  | "crescent"
  | "cross";

export interface FlashCard {
  id: string;
  /** Word/phrase shown on the front — TTS reads this aloud. */
  front: string;
  back?: string;
  image?: FlashCardImage;
  /** Optional audio URL override; otherwise the front text is spoken via TTS. */
  audioUrl?: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: DeckCategory;
  /** lucide-react icon name as a string, e.g. "Mic". */
  icon: string;
  /** Hex accent color used for UI tinting, e.g. "#f97316". */
  accent: string;
  targetAge?: string;
  hint?: string;
  cards: FlashCard[];
}

/** A course groups several decks into lessons — the "Google Classroom" unit. */
export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  deckIds: string[];
}

export const DECK_CATEGORY_META: Record<
  DeckCategory,
  { label: string; className: string }
> = {
  articulation: {
    label: "Articulation",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  },
  phonology: {
    label: "Phonology",
    className:
      "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  },
  vocabulary: {
    label: "Vocabulary",
    className:
      "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  },
  grammar: {
    label: "Grammar",
    className:
      "bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300",
  },
  language: {
    label: "Language",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  math: {
    label: "Math",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  reinforcement: {
    label: "Rewards",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
  },
};

export function categoryLabel(category: DeckCategory): string {
  return DECK_CATEGORY_META[category].label;
}
