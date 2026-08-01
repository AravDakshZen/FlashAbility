import Link from "next/link";
import {
  BookOpen,
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
  AudioLines,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { categoryLabel, DECK_CATEGORY_META, type Deck } from "@/types/decks";
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

export function DeckCard({
  deck,
  className,
}: {
  deck: Deck;
  className?: string;
}) {
  const Icon = ICON_MAP[deck.icon] ?? BookOpen;

  return (
    <Link
      href={`/decks/${deck.id}`}
      className={cn(
        "group/deck block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring",
        className
      )}
      aria-label={`${deck.title} deck, ${deck.cards.length} cards`}
    >
      <Card className="h-full transition-all duration-200 group-hover/deck:-translate-y-0.5 group-hover/deck:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <span
              className="flex size-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${deck.accent}1f`, color: deck.accent }}
              aria-hidden="true"
            >
              <Icon className="size-6" />
            </span>
            <Badge
              variant="secondary"
              className={DECK_CATEGORY_META[deck.category].className}
            >
              {categoryLabel(deck.category)}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-lg">{deck.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {deck.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-4" aria-hidden="true" />
            {deck.cards.length} cards
          </span>
          {deck.targetAge ? (
            <span aria-label={`Ages ${deck.targetAge}`}>{deck.targetAge}</span>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
