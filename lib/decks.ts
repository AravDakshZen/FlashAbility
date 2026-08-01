import { courses, decks } from "@/lib/data/decks";
import type { Course, Deck } from "@/types/decks";

export function getAllDecks(): Deck[] {
  return decks;
}

// Case-insensitive lookup so URLs like /decks/Animals still resolve.
export function getDeckById(id: string): Deck | undefined {
  const normalized = id.trim().toLowerCase();
  return decks.find((deck) => deck.id.toLowerCase() === normalized);
}

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

export function getCourseDecks(course: Course): Deck[] {
  return course.deckIds
    .map((deckId) => getDeckById(deckId))
    .filter((deck): deck is Deck => Boolean(deck));
}

export function getTotalCardCount(decksInCourse: Deck[]): number {
  return decksInCourse.reduce((sum, deck) => sum + deck.cards.length, 0);
}
