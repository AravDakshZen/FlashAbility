"use client";

import { Check, Gauge } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SPEECH_RATE_LABELS, type SpeechRate } from "@/lib/accessibility";

const SPEECH_RATES: readonly SpeechRate[] = ["slow", "normal", "fast"];

type SpeechRateGroupProps = {
  speechRate: SpeechRate;
  onSelect: (rate: SpeechRate) => void;
};

export function SpeechRateGroup({ speechRate, onSelect }: SpeechRateGroupProps) {
  return (
    <>
      {SPEECH_RATES.map((rate) => (
        <DropdownMenuItem
          key={rate}
          onClick={() => onSelect(rate)}
          disabled={speechRate === rate}
          className="min-h-11"
        >
          <Gauge aria-hidden="true" />
          {SPEECH_RATE_LABELS[rate]}
          {speechRate === rate ? (
            <Check className="ml-auto" aria-hidden="true" />
          ) : null}
        </DropdownMenuItem>
      ))}
    </>
  );
}
