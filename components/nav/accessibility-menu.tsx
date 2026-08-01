"use client";

import { useCallback, useRef } from "react";
import {
  Accessibility,
  Check,
  Contrast,
  Gauge,
  Keyboard,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  Type,
  Volume2,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SPEECH_RATE_LABELS,
  type SpeechRate,
  type TextSize,
} from "@/lib/accessibility";
import { useAccessibility } from "@/providers/accessibility-provider";
import { cn } from "@/lib/utils";

const TEXT_SIZES: readonly TextSize[] = ["sm", "base", "lg", "xl"];
const SPEECH_RATES: readonly SpeechRate[] = ["slow", "normal", "fast"];

/** Announces status changes to assistive technology. */
function useAnnouncer() {
  const ref = useRef<HTMLParagraphElement>(null);
  const announce = useCallback((message: string) => {
    if (ref.current) ref.current.textContent = message;
  }, []);
  return { ref, announce };
}

/**
 * Accessibility dropdown — every toggle writes real settings through the
 * shared AccessibilityProvider (same state as the learn-player menu), and
 * the provider persists them to localStorage.
 */
export function AccessibilityMenu({
  variant = "main",
  className,
}: {
  /** "utility" renders a compact light trigger for the black utility bar. */
  variant?: "utility" | "main";
  className?: string;
}) {
  const { settings, update } = useAccessibility();
  const { resolvedTheme, setTheme } = useTheme();
  const { ref: liveRef, announce } = useAnnouncer();

  const isDark = resolvedTheme === "dark";
  const sizeIndex = TEXT_SIZES.indexOf(settings.textSize);
  const canDecrease = sizeIndex > 0;
  const canIncrease = sizeIndex < TEXT_SIZES.length - 1;

  function changeTextSize(next: TextSize, message: string) {
    update("textSize", next);
    announce(message);
  }

  function toggleBoolean(
    key: "highContrast" | "dyslexiaMode" | "reduceMotion" | "autoRead",
    label: string
  ) {
    const next = !settings[key];
    update(key, next);
    announce(`${label} ${next ? "enabled" : "disabled"}`);
  }

  function focusFirstNavLink() {
    const firstLink = document.querySelector<HTMLElement>(
      'nav[aria-label="Main"] a'
    );
    if (firstLink) {
      firstLink.focus();
      announce("Focus moved to the main navigation. Use arrow keys to move.");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant={variant === "utility" ? "ghost" : "outline"}
              size="sm"
              aria-label="Accessibility options"
              className={cn(
                "min-h-11 gap-2",
                variant === "utility" &&
                  "h-7 min-h-7 gap-1.5 px-2.5 text-xs text-white hover:bg-white/10 hover:text-white",
                className
              )}
            >
              <Accessibility
                className={cn("size-4", variant === "utility" && "size-3.5")}
                aria-hidden="true"
              />
              {variant === "utility" ? (
                <span className="hidden sm:inline">Accessibility</span>
              ) : (
                <span className="hidden md:inline">Accessibility</span>
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-72 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuGroup>
            <DropdownMenuLabel className="pt-3">Text Size</DropdownMenuLabel>
            <div className="grid grid-cols-3 gap-1">
            <DropdownMenuItem
              onClick={() =>
                canDecrease
                  ? changeTextSize(
                      TEXT_SIZES[sizeIndex - 1],
                      "Text size decreased"
                    )
                  : announce("Text size is already at its smallest")
              }
              disabled={!canDecrease}
              className="flex-col gap-1 py-2.5 text-xs"
            >
              <Minus className="size-4" aria-hidden="true" />
              Decrease
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                canIncrease
                  ? changeTextSize(
                      TEXT_SIZES[sizeIndex + 1],
                      "Text size increased"
                    )
                  : announce("Text size is already at its largest")
              }
              disabled={!canIncrease}
              className="flex-col gap-1 py-2.5 text-xs"
            >
              <Plus className="size-4" aria-hidden="true" />
              Increase
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                changeTextSize("base", "Text size reset to default")
              }
              disabled={settings.textSize === "base"}
              className="flex-col gap-1 py-2.5 text-xs"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </DropdownMenuItem>
          </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => toggleBoolean("highContrast", "High contrast mode")}
            className="min-h-11"
          >
            <Contrast aria-hidden="true" />
            High Contrast
            {settings.highContrast ? (
              <Check className="ml-auto" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleBoolean("dyslexiaMode", "Dyslexia mode")}
            className="min-h-11"
          >
            <Type aria-hidden="true" />
            Dyslexia Mode
            {settings.dyslexiaMode ? (
              <Check className="ml-auto" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setTheme("light")}
            disabled={!isDark}
            className="min-h-11"
          >
            <Sun aria-hidden="true" />
            Light Mode
            {!isDark ? <Check className="ml-auto" aria-hidden="true" /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            disabled={isDark}
            className="min-h-11"
          >
            <Moon aria-hidden="true" />
            Dark Mode
            {isDark ? <Check className="ml-auto" aria-hidden="true" /> : null}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={focusFirstNavLink} className="min-h-11">
            <Keyboard aria-hidden="true" />
            Keyboard Navigation
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleBoolean("autoRead", "Auto-read cards")}
            className="min-h-11"
          >
            <Volume2 aria-hidden="true" />
            Auto-Read Cards
            {settings.autoRead ? (
              <Check className="ml-auto" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>

          <DropdownMenuGroup>
            <DropdownMenuLabel className="pt-3">Speech Rate</DropdownMenuLabel>
            {SPEECH_RATES.map((rate) => (
            <DropdownMenuItem
              key={rate}
              onClick={() => {
                update("speechRate", rate);
                announce(
                  `Speech rate set to ${SPEECH_RATE_LABELS[rate].toLowerCase()}`
                );
              }}
              disabled={settings.speechRate === rate}
              className="min-h-11"
            >
              <Gauge aria-hidden="true" />
              {SPEECH_RATE_LABELS[rate]}
              {settings.speechRate === rate ? (
                <Check className="ml-auto" aria-hidden="true" />
              ) : null}
            </DropdownMenuItem>
          ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => toggleBoolean("reduceMotion", "Reduced motion")}
            className="min-h-11"
          >
            <Accessibility aria-hidden="true" />
            Reduced Motion
            {settings.reduceMotion ? (
              <Check className="ml-auto" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p ref={liveRef} className="sr-only" role="status" aria-live="polite" />
    </>
  );
}
