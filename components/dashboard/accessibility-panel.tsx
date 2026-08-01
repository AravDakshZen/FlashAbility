"use client";

import { Accessibility, Type, Contrast, Volume2, Subtitles, Waves } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAccessibility, type AccessibilityPreferences } from "@/providers/accessibility-provider";

const PREFERENCE_ROWS: {
  key: keyof AccessibilityPreferences;
  label: string;
  description: string;
  icon: typeof Contrast;
}[] = [
  {
    key: "highContrast",
    label: "High contrast",
    description: "Strengthens borders and text for colour-blind and low-vision users.",
    icon: Contrast,
  },
  {
    key: "largeFont",
    label: "Larger fonts",
    description: "Scales the interface text up for easier reading.",
    icon: Type,
  },
  {
    key: "reducedMotion",
    label: "Reduced motion",
    description: "Minimises animations and transitions across the dashboard.",
    icon: Waves,
  },
  {
    key: "textToSpeech",
    label: "Text-to-speech",
    description: "Reads lesson content aloud using your device voice.",
    icon: Volume2,
  },
  {
    key: "captions",
    label: "Captions",
    description: "Shows captions on audio and video content.",
    icon: Subtitles,
  },
];

/** Accessibility preferences sheet — the dashboard adapts in real time. */
export function AccessibilityPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { preferences, setPreference, reset } = useAccessibility();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
              <Accessibility className="size-4.5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <SheetTitle className="text-base">Accessibility</SheetTitle>
              <SheetDescription className="text-xs">
                Preferences apply instantly and are saved on this device.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-1.5">
          {PREFERENCE_ROWS.map((row) => (
            <div
              key={row.key}
              className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <row.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{row.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {row.description}
                  </span>
                </div>
              </div>
              <Switch
                checked={preferences[row.key]}
                onCheckedChange={(checked) => setPreference(row.key, checked)}
                aria-label={`Toggle ${row.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            These settings follow WCAG 2.x AA guidance.
          </p>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset all
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
