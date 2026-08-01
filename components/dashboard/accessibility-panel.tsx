"use client";

import {
  Accessibility,
  Contrast,
  Languages,
  MousePointerClick,
  Type,
  Volume2,
  Wind,
  RotateCcw,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  SPEECH_RATE_LABELS,
  TEXT_SIZE_LABELS,
  type SpeechRate,
  type TextSize,
} from "@/lib/accessibility";
import { useAccessibility } from "@/providers/accessibility-provider";

/** Accessibility settings sheet — every change applies instantly and persists. */
export function AccessibilityPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { settings, update, reset } = useAccessibility();

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
                Modes apply instantly and are saved on this device.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-1.5">
          {/* Text size */}
          <div className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Type className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Text size</span>
                <span className="text-xs text-muted-foreground">
                  Scales all text across the dashboard.
                </span>
              </div>
            </div>
            <ToggleGroup
              value={[settings.textSize]}
              onValueChange={(value) => {
                if (value[0]) update("textSize", value[0] as TextSize);
              }}
              variant="outline"
              size="sm"
            >
              {(Object.keys(TEXT_SIZE_LABELS) as TextSize[]).map((size) => (
                <ToggleGroupItem
                  key={size}
                  value={size}
                  aria-label={TEXT_SIZE_LABELS[size]}
                >
                  {TEXT_SIZE_LABELS[size]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* High contrast */}
          <div className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Contrast className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">High contrast</span>
                <span className="text-xs text-muted-foreground">
                  Stronger colors for low-vision users.
                </span>
              </div>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => update("highContrast", checked)}
              aria-label="Toggle high contrast"
            />
          </div>

          {/* Dyslexia-friendly */}
          <div className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Languages className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Dyslexia-friendly</span>
                <span className="text-xs text-muted-foreground">
                  Clearer letters and spacing.
                </span>
              </div>
            </div>
            <Switch
              checked={settings.dyslexiaMode}
              onCheckedChange={(checked) => update("dyslexiaMode", checked)}
              aria-label="Toggle dyslexia-friendly mode"
            />
          </div>

          {/* Reduced motion */}
          <div className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Wind className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Reduce motion</span>
                <span className="text-xs text-muted-foreground">
                  Minimises animations and transitions.
                </span>
              </div>
            </div>
            <Switch
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => update("reduceMotion", checked)}
              aria-label="Toggle reduced motion"
            />
          </div>

          {/* Speech speed */}
          <div className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Volume2 className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Speech speed</span>
                <span className="text-xs text-muted-foreground">
                  How fast words are read aloud.
                </span>
              </div>
            </div>
            <ToggleGroup
              value={[settings.speechRate]}
              onValueChange={(value) => {
                if (value[0]) update("speechRate", value[0] as SpeechRate);
              }}
              variant="outline"
              size="sm"
            >
              {(Object.keys(SPEECH_RATE_LABELS) as SpeechRate[]).map((rate) => (
                <ToggleGroupItem
                  key={rate}
                  value={rate}
                  aria-label={SPEECH_RATE_LABELS[rate]}
                >
                  {SPEECH_RATE_LABELS[rate]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Auto-read */}
          <div className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <MousePointerClick className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Read cards aloud</span>
                <span className="text-xs text-muted-foreground">
                  Automatically speak each new card.
                </span>
              </div>
            </div>
            <Switch
              checked={settings.autoRead}
              onCheckedChange={(checked) => update("autoRead", checked)}
              aria-label="Toggle read cards aloud"
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            These settings follow WCAG 2.x AA guidance.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset all
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
