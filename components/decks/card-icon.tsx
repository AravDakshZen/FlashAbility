import {
  Armchair,
  Frown,
  Footprints,
  GlassWater,
  Hand,
  HandMetal,
  HeartHandshake,
  Moon,
  MoveUp,
  Music,
  PenTool,
  PersonStanding,
  Send,
  Smile,
  Turtle,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";

/**
 * Named lucide icons used for flashcard images that don't need colour.
 * Cards reference these by name (e.g. image: { type: "icon", value: "run" })
 * so the data stays JSON-friendly and the icon renders as a monochrome SVG.
 */
export const CARD_ICONS: Record<string, LucideIcon> = {
  jump: MoveUp,
  run: Footprints,
  eat: Utensils,
  drink: GlassWater,
  sleep: Moon,
  swim: Waves,
  clap: Hand,
  wave: HandMetal,
  laugh: Smile,
  cry: Frown,
  dance: Music,
  sit: Armchair,
  stand: PersonStanding,
  throw: Send,
  kick: Footprints,
  crawl: Turtle,
  hug: HeartHandshake,
  draw: PenTool,
};

export function CardIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = CARD_ICONS[name];
  if (!Icon) return null;
  // Monochrome — inherits currentColor so it adapts to the surrounding theme.
  return <Icon className={className} aria-hidden="true" />;
}
