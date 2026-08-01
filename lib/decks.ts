import { courses, decks } from "@/lib/data/decks";
import type { Course, Deck, DeckCategory } from "@/types/decks";

/** All decks, in their curated order. */
export function getAllDecks(): Deck[] {
  return decks;
}

/** Case-insensitive lookup by slug. */
export function getDeckById(id: string): Deck | undefined {
  const normalized = id.trim().toLowerCase();
  return decks.find((deck) => deck.id.toLowerCase() === normalized);
}

export function getDecksByCategory(category: DeckCategory): Deck[] {
  return decks.filter((deck) => deck.category === category);
}

/** Decks in the same category, excluding the given deck. */
export function getRelatedDecks(deck: Deck, count = 3): Deck[] {
  return decks
    .filter((other) => other.id !== deck.id && other.category === deck.category)
    .slice(0, count);
}

export function getAllCourses(): Course[] {
  return courses;
}

export function getCourseById(id: string): Course | undefined {
  const normalized = id.trim().toLowerCase();
  return courses.find((course) => course.id.toLowerCase() === normalized);
}

/** Decks belonging to a course, preserving lesson order. */
export function getCourseDecks(course: Course): Deck[] {
  return course.deckIds
    .map((deckId) => getDeckById(deckId))
    .filter((deck): deck is Deck => Boolean(deck));
}

export function getCardCount(deck: Deck): number {
  return deck.cards.length;
}

/** Total cards across a list of decks (used for course progress). */
export function getTotalCardCount(decksInCourse: Deck[]): number {
  return decksInCourse.reduce((sum, deck) => sum + deck.cards.length, 0);
}
