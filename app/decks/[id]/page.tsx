import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Info, Monitor, Play } from "lucide-react";
import type { Metadata } from "next";
import {
  AudioLines,
  Calculator,
  GitCompareArrows,
  Layers,
  Layers2,
  MessageCircleQuestion,
  Mic,
  PawPrint,
  PersonStanding,
  Shapes,
  Speech,
  Star,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAllDecks, getDeckById, getRelatedDecks } from "@/lib/decks";
import { DeckCard } from "@/components/decks/deck-card";
import { DeckStats } from "@/components/decks/deck-stats";
import {
  categoryLabel,
  DECK_CATEGORY_META,
  type Deck,
} from "@/types/decks";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Mic,
  GitCompareArrows,
  PersonStanding,
  Layers,
  Shapes,
  MessageCircleQuestion,
  Layers2,
  Star,
  PawPrint,
  AudioLines,
  Calculator,
  Speech,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDecks().map((deck) => ({ id: deck.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return params.then(({ id }) => {
    const deck = getDeckById(id);
    return {
      title: deck ? `${deck.title} · Decks` : "Deck not found",
      description: deck?.description,
    };
  });
}

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deck = getDeckById(id);
  if (!deck) notFound();

  const related = getRelatedDecks(deck, 3);
  const Icon = ICON_MAP[deck.icon] ?? BookOpen;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/courses"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All courses
        </Link>

        <header className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                className="flex size-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${deck.accent}1f`, color: deck.accent }}
                aria-hidden="true"
              >
                <Icon className="size-7" />
              </span>
              <Badge className={DECK_CATEGORY_META[deck.category].className}>
                {categoryLabel(deck.category)}
              </Badge>
            </div>
            <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {deck.title}
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground">
              {deck.description}
            </p>
            <DeckStats deckId={deck.id} cardCount={deck.cards.length} />
            {deck.targetAge ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Ages {deck.targetAge}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/decks/${deck.id}/learn`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-h-12 px-8 text-base")}
            >
              <BookOpen className="size-5" aria-hidden="true" />
              Learning Mode
            </Link>
            <Link
              href={`/decks/${deck.id}/test`}
              className={cn(buttonVariants({ size: "lg" }), "min-h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white")}
            >
              <Play className="size-5" aria-hidden="true" />
              Take Test
            </Link>
            <Link
              href={`/decks/${deck.id}/epaper`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-12 px-8 text-base"
              )}
            >
              <Monitor className="size-5" aria-hidden="true" />
              E-Paper Mode
            </Link>
          </div>
        </header>

        {deck.hint ? (
          <div className="mt-8 flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p>
              <span className="font-medium">Clinician note: </span>
              {deck.hint}
            </p>
          </div>
        ) : null}

        <section aria-label="Card preview" className="mt-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Cards in this deck
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {deck.cards.map((card) => (
              <li key={card.id}>
                <Card className="h-full">
                  <CardContent className="flex flex-col items-center justify-center gap-2 py-5 text-center">
                    <span className="text-3xl" aria-hidden="true">
                      {card.image?.type === "emoji" ? card.image.value : ""}
                    </span>
                    <span className="text-base font-medium">{card.front}</span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 ? (
          <section aria-label="Related decks" className="mt-14">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              More in {categoryLabel(deck.category)}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item: Deck) => (
                <li key={item.id} className="h-full">
                  <DeckCard deck={item} className="h-full" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
