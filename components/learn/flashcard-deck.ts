export interface Flashcard {
  id: string;
  /** Large visual â€” an emoji rendered as the card picture. */
  picture: string;
  /** Short word/phrase, read aloud by the play button. */
  title: string;
  /** Plain-language description. */
  description: string;
  /** Soft tint behind the picture, with both light and dark variants. */
  tint: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subtitle: string;
  cards: Flashcard[];
}

/**
 * Sample deck â€” "First Words". Real decks will come from the database;
 * the player component is data-agnostic and only needs a `FlashcardDeck`.
 */
export const sampleDeck: FlashcardDeck = {
  id: "first-words",
  title: "First Words",
  subtitle: "Everyday objects for early learners",
  cards: [
    {
      id: "apple",
      picture: "ðŸŽ",
      title: "Apple",
      description: "A round fruit. It is red and sweet.",
      tint: "bg-rose-100 dark:bg-rose-950/40",
    },
    {
      id: "ball",
      picture: "âš½",
      title: "Ball",
      description: "A round toy. We kick and throw it.",
      tint: "bg-amber-100 dark:bg-amber-950/40",
    },
    {
      id: "cat",
      picture: "ðŸ±",
      title: "Cat",
      description: "A small pet. It says meow.",
      tint: "bg-orange-100 dark:bg-orange-950/40",
    },
    {
      id: "dog",
      picture: "ðŸ¶",
      title: "Dog",
      description: "A friendly pet. It says woof.",
      tint: "bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      id: "sun",
      picture: "â˜€ï¸",
      title: "Sun",
      description: "The bright star in the sky. It keeps us warm.",
      tint: "bg-yellow-100 dark:bg-yellow-950/40",
    },
    {
      id: "cup",
      picture: "ðŸ¥›",
      title: "Cup",
      description: "We drink water from a cup.",
      tint: "bg-sky-100 dark:bg-sky-950/40",
    },
    {
      id: "book",
      picture: "ðŸ“–",
      title: "Book",
      description: "A story with pages. We read it.",
      tint: "bg-violet-100 dark:bg-violet-950/40",
    },
    {
      id: "tree",
      picture: "ðŸŒ³",
      title: "Tree",
      description: "A tall plant with green leaves.",
      tint: "bg-green-100 dark:bg-green-950/40",
    },
    {
      id: "fish",
      picture: "ðŸŸ",
      title: "Fish",
      description: "An animal that swims in water.",
      tint: "bg-cyan-100 dark:bg-cyan-950/40",
    },
    {
      id: "flower",
      picture: "ðŸŒ¸",
      title: "Flower",
      description: "A pretty plant with petals. It smells nice.",
      tint: "bg-pink-100 dark:bg-pink-950/40",
    },
  ],
};
