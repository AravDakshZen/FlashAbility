import type { Course, FlashCard } from "@/types/decks";
import { getCourseDecks } from "@/lib/decks";

/**
 * Auto-graded course tests.
 *
 * A test samples cards from a course's lessons and turns each into a "name
 * the picture" question: the card's visual is shown and the learner picks the
 * matching word from four options. Options are drawn from other cards in the
 * same course so they stay relevant to what was taught.
 */

export interface TestQuestion {
  card: FlashCard;
  options: string[];
}

export const TEST_QUESTION_COUNT = 10;
export const TEST_OPTIONS = 4;

/** Spoken aloud (with a distinct voice) for counting cards. */
export const COUNTING_PROMPT = "How many?";

/** True when the card asks the learner to count objects (its answer is a number). */
export function isCountingCard(card: FlashCard): boolean {
  return /^\d{1,2}$/.test(card.front.trim());
}

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Every card the course test can ask about. Celebration/reinforcement cards
 * are excluded — they are not learnable content.
 */
export function getTestCardPool(course: Course): FlashCard[] {
  return getCourseDecks(course)
    .filter((deck) => deck.category !== "reinforcement")
    .flatMap((deck) => deck.cards);
}

/**
 * Builds a randomized test for a course: up to `count` questions, each with
 * the card's front as the answer and three distractor fronts from the same
 * course. Duplicate answer words are avoided.
 */
export function buildTest(course: Course, count = TEST_QUESTION_COUNT): TestQuestion[] {
  const pool = getTestCardPool(course);
  const seen = new Set<string>();
  const picked: FlashCard[] = [];

  for (const card of shuffle(pool)) {
    if (seen.has(card.front)) continue;
    seen.add(card.front);
    picked.push(card);
    if (picked.length >= count) break;
  }

  return picked.map((card) => {
    const distractorFronts = [...new Set(pool.map((c) => c.front))].filter(
      (front) => front !== card.front
    );
    const options = shuffle([card.front, ...shuffle(distractorFronts).slice(0, TEST_OPTIONS - 1)]);
    return { card, options };
  });
}
