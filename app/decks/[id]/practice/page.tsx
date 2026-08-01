import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PracticePlayer } from "@/components/decks/practice-player";
import { getDeckById } from "@/lib/decks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deck = getDeckById(id);
  return { title: deck ? `${deck.title} · Practice` : "Deck not found" };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deck = getDeckById(id);
  if (!deck) notFound();

  return <PracticePlayer deck={deck} />;
}
