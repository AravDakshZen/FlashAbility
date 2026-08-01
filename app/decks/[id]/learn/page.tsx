import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LearnPlayer } from "@/components/decks/learn-player";
import { getDeckById } from "@/lib/decks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deck = getDeckById(id);
  return { title: deck ? `${deck.title} · Learn` : "Deck not found" };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deck = getDeckById(id);
  if (!deck) notFound();

  return <LearnPlayer deck={deck} />;
}
