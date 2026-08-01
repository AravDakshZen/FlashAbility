"use client";

import { useMemo, useState } from "react";

import { DeckCard } from "@/components/decks/deck-card";
import { DECK_CATEGORY_META, type Deck, type DeckCategory } from "@/types/decks";
import { cn } from "@/lib/utils";

type Filter = "all" | DeckCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...(Object.keys(DECK_CATEGORY_META) as DeckCategory[]).map((category) => ({
    id: category as Filter,
    label: DECK_CATEGORY_META[category].label,
  })),
];

export function DeckGrid({ decks }: { decks: Deck[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? decks : decks.filter((d) => d.category === filter)),
    [decks, filter]
  );

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter decks by category"
      >
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
              filter === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((deck) => (
            <li key={deck.id} className="h-full">
              <DeckCard deck={deck} className="h-full" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          No decks in this category yet. Try another filter.
        </p>
      )}
    </div>
  );
}
