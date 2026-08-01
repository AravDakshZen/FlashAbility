import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EpaperPlayer } from "@/components/decks/epaper-player";
import { getAllDecks, getDeckById } from "@/lib/decks";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDecks().map((deck) => ({ id: deck.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deck = getDeckById(id);
  return { title: deck ? `${deck.title} · E-Paper` : "Deck not found" };
}

export default async function EpaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deck = getDeckById(id);
  if (!deck) notFound();

  return <EpaperPlayer deck={deck} />;
}
