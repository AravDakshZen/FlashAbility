"use client";

import * as React from "react";
import {
  Accessibility,
  Contrast,
  Languages,
  MousePointerClick,
  RotateCcw,
  Type,
  Volume2,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  SPEECH_RATE_LABELS,
  TEXT_SIZE_LABELS,
  type SpeechRate,
  type TextSize,
} from "@/lib/accessibility";
import { useAccessibility } from "@/providers/accessibility-provider";

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl p-3 transition-colors hover:bg-muted/60">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0 pt-1">{children}</div>
    </div>
  );
}

export function AccessibilityMenu() {
  const { settings, update, reset } = useAccessibility();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-xl"
            aria-label="Open accessibility options"
            title="Accessibility options"
          />
        }
      >
        <Accessibility className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm gap-0 overflow-y-auto p-0 sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Accessibility className="size-5" aria-hidden="true" />
            Accessibility
          </SheetTitle>
          <SheetDescription>
            Choose the modes that help you learn best. Your choices are saved
            on this device.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1 p-3">
          <SettingRow
            icon={Type}
            title="Text size"
            description="Make all text bigger or smaller."
          >
            <ToggleGroup
              value={[settings.textSize]}
              onValueChange={(value) => {
                if (value[0]) update("textSize", value[0] as TextSize);
              }}
              variant="outline"
              size="sm"
            >
              {(
                Object.keys(TEXT_SIZE_LABELS) as TextSize[]
              ).map((size) => (
                <ToggleGroupItem key={size} value={size} aria-label={TEXT_SIZE_LABELS[size]}>
                  {TEXT_SIZE_LABELS[size]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SettingRow>

          <SettingRow
            icon={Contrast}
            title="High contrast"
            description="Stronger colors for low vision."
          >
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => update("highContrast", checked)}
              aria-label="High contrast"
            />
          </SettingRow>

          <SettingRow
            icon={Languages}
            title="Dyslexia-friendly"
            description="Clearer letters and spacing."
          >
            <Switch
              checked={settings.dyslexiaMode}
              onCheckedChange={(checked) => update("dyslexiaMode", checked)}
              aria-label="Dyslexia-friendly mode"
            />
          </SettingRow>

          <SettingRow
            icon={Wind}
            title="Reduce motion"
            description="Turn off movement and animations."
          >
            <Switch
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => update("reduceMotion", checked)}
              aria-label="Reduce motion"
            />
          </SettingRow>

          <SettingRow
            icon={Volume2}
            title="Speech speed"
            description="How fast words are read aloud."
          >
            <ToggleGroup
              value={[settings.speechRate]}
              onValueChange={(value) => {
                if (value[0]) update("speechRate", value[0] as SpeechRate);
              }}
              variant="outline"
              size="sm"
            >
              {(
                Object.keys(SPEECH_RATE_LABELS) as SpeechRate[]
              ).map((rate) => (
                <ToggleGroupItem key={rate} value={rate} aria-label={SPEECH_RATE_LABELS[rate]}>
                  {SPEECH_RATE_LABELS[rate]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SettingRow>

          <SettingRow
            icon={MousePointerClick}
            title="Read cards aloud"
            description="Automatically speak each new card."
          >
            <Switch
              checked={settings.autoRead}
              onCheckedChange={(checked) => update("autoRead", checked)}
              aria-label="Automatically read cards aloud"
            />
          </SettingRow>
        </div>

        <SheetFooter className="mt-auto border-t p-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset to defaults
          </Button>
          <SheetClose
            render={<Button type="button" variant="outline" className="w-full" />}
          >
            Done
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
