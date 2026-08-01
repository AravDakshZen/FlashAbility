import { Accessibility, AudioLines, Volume2 } from "lucide-react";

/** Minimal hero visual: a tablet showing a flashcard, with floating audio and accessibility chips. */
export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      {/* Soft gradient backdrop */}
      <div className="absolute inset-x-6 top-10 bottom-0 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl" />

      {/* Tablet */}
      <div className="relative rounded-[2.25rem] border border-border bg-card p-3 shadow-2xl">
        <div className="relative overflow-hidden rounded-[1.75rem] border bg-background">
          {/* Window chrome */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-destructive/60" />
              <span className="size-2.5 rounded-full bg-amber-400/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              e-Flash Cards
            </span>
          </div>

          {/* Flashcard */}
          <div className="flex flex-col items-center gap-3 px-6 py-8">
            <div className="relative w-full max-w-60">
              <div className="absolute inset-0 rotate-2 rounded-2xl border bg-muted/60" />
              <div className="relative rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Word
                  </span>
                  <Volume2 className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-xl font-semibold tracking-tight">Apple</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2 flex-1 rounded-full bg-muted" />
                  <span className="h-2 w-16 rounded-full bg-primary/40" />
                </div>
              </div>
            </div>
            {/* Card indicator dots */}
            <div className="flex gap-1.5">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="size-1.5 rounded-full bg-border" />
              <span className="size-1.5 rounded-full bg-border" />
            </div>
          </div>
        </div>
        {/* Home indicator */}
        <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-border" />
      </div>

      {/* Floating chip: audio */}
      <div className="absolute top-6 -left-3 flex items-center gap-2 rounded-2xl border bg-card/90 px-3 py-2 shadow-lg backdrop-blur sm:-left-8">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <AudioLines className="size-4" />
        </span>
        <span className="flex flex-col">
          <span className="text-xs font-medium">Listen</span>
          <span className="text-[10px] text-muted-foreground">Text-to-speech</span>
        </span>
      </div>

      {/* Floating chip: accessibility */}
      <div className="absolute -right-3 bottom-8 flex items-center gap-2 rounded-2xl border bg-card/90 px-3 py-2 shadow-lg backdrop-blur sm:-right-8">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Accessibility className="size-4" />
        </span>
        <span className="flex flex-col">
          <span className="text-xs font-medium">Accessible</span>
          <span className="text-[10px] text-muted-foreground">High contrast</span>
        </span>
      </div>
    </div>
  );
}
