import Link from "next/link";
import type { Metadata } from "next";

import { DeckGrid } from "@/components/decks/deck-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAllDecks } from "@/lib/decks";
import { categoryLabel } from "@/types/decks";

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Browse the FlashAbility library — speech & language therapy materials in interactive, electronic format.",
};

export default async function DecksPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const q = query?.trim().toLowerCase();
  const allDecks = getAllDecks();
  const decks = q
    ? allDecks.filter(
        (deck) =>
          deck.title.toLowerCase().includes(q) ||
          deck.description.toLowerCase().includes(q) ||
          categoryLabel(deck.category).toLowerCase().includes(q)
      )
    : allDecks;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Flash card library
          </p>
          <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Flashcards
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Interactive speech &amp; language materials for therapy sessions —
            tap a deck to practice, listen, and earn stars.
          </p>
          {q ? (
            <p className="mt-4 rounded-lg border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
              {decks.length === 0
                ? `No decks found for “${query}”.`
                : `${decks.length} deck${decks.length !== 1 ? "s" : ""} found for “${query}”.`}{" "}
              <Link
                href="/decks"
                className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                Clear search
              </Link>
            </p>
          ) : null}
        </header>
        <section aria-label="Deck library" className="mt-8">
          <DeckGrid decks={decks} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
