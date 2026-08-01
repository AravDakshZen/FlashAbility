import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AccessibilityMenu } from "@/components/learn/accessibility-menu";
import { sampleDeck } from "@/components/learn/flashcard-deck";
import { FlashcardPlayer } from "@/components/learn/flashcard-player";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn",
};

export default function LearnPage() {
  return (
    <main id="main" className="flex min-h-svh flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "gap-1.5 rounded-xl text-sm"
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate font-heading text-sm font-semibold">
              {sampleDeck.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {sampleDeck.subtitle}
            </p>
          </div>
          <AccessibilityMenu />
        </div>
      </header>

      {/* Player */}
      <section
        aria-label={sampleDeck.title}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-10 sm:px-6"
      >
        <FlashcardPlayer deck={sampleDeck} />
      </section>
    </main>
  );
}
