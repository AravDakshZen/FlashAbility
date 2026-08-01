"use client";

import {
  Check,
  Contrast,
  Keyboard,
  Moon,
  PersonStanding,
  Sun,
  Type,
  Volume2,
} from "lucide-react";
import { useTheme } from "next-themes";

import { SpeechRateGroup } from "@/components/nav/speech-rate-group";
import { TextSizeControls } from "@/components/nav/text-size-controls";
import { useAnnouncer } from "@/components/nav/use-announcer";
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
import { type SpeechRate, type TextSize } from "@/lib/accessibility";
import { useAccessibility } from "@/providers/accessibility-provider";
import { cn } from "@/lib/utils";

const TEXT_SIZES: readonly TextSize[] = ["sm", "base", "lg", "xl"];

export function AccessibilityMenu({
  variant = "main",
  className,
}: {
  variant?: "utility" | "main" | "floating";
  className?: string;
}) {
  const { settings, update } = useAccessibility();
  const { resolvedTheme, setTheme } = useTheme();
  const { ref: liveRef, announce } = useAnnouncer();

  const isDark = resolvedTheme === "dark";

  const isFloating = variant === "floating";

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

  function changeSpeechRate(rate: SpeechRate) {
    update("speechRate", rate);
    announce(`Speech rate set to ${rate}`);
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
              variant={variant === "utility" ? "ghost" : isFloating ? "default" : "outline"}
              size={isFloating ? "icon" : "sm"}
              aria-label="Accessibility options"
              className={cn(
                "min-h-11 gap-2",
                variant === "utility" &&
                  "h-7 min-h-7 gap-1.5 px-2.5 text-xs text-white hover:bg-white/10 hover:text-white",
                isFloating &&
                  "fixed bottom-4 right-4 z-50 size-14 rounded-full shadow-lg",
                className
              )}
            >
              <PersonStanding
                className={cn("size-4", variant === "utility" && "size-3.5", isFloating && "size-6")}
                aria-hidden="true"
              />
              {!isFloating &&
                (variant === "utility" ? (
                  <span className="hidden sm:inline">Accessibility</span>
                ) : (
                  <span className="hidden md:inline">Accessibility</span>
                ))}
            </Button>
          }
        />
        <DropdownMenuContent align={isFloating ? "end" : "end"} className="w-72 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuGroup>
            <DropdownMenuLabel className="pt-3">Text Size</DropdownMenuLabel>
            <TextSizeControls
              sizes={TEXT_SIZES}
              textSize={settings.textSize}
              onChange={changeTextSize}
              onAnnounce={announce}
            />
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
            <SpeechRateGroup
              speechRate={settings.speechRate}
              onSelect={changeSpeechRate}
            />
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => toggleBoolean("reduceMotion", "Reduced motion")}
            className="min-h-11"
          >
            <PersonStanding aria-hidden="true" />
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
