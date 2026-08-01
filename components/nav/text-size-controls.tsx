"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { TextSize } from "@/lib/accessibility";

type TextSizeControlsProps = {
  sizes: readonly TextSize[];
  textSize: TextSize;
  onChange: (next: TextSize, message: string) => void;
  onAnnounce: (message: string) => void;
};

export function TextSizeControls({
  sizes,
  textSize,
  onChange,
  onAnnounce,
}: TextSizeControlsProps) {
  const sizeIndex = sizes.indexOf(textSize);
  const canDecrease = sizeIndex > 0;
  const canIncrease = sizeIndex < sizes.length - 1;

  return (
    <div className="grid grid-cols-3 gap-1">
      <DropdownMenuItem
        onClick={() =>
          canDecrease
            ? onChange(sizes[sizeIndex - 1], "Text size decreased")
            : onAnnounce("Text size is already at its smallest")
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
            ? onChange(sizes[sizeIndex + 1], "Text size increased")
            : onAnnounce("Text size is already at its largest")
        }
        disabled={!canIncrease}
        className="flex-col gap-1 py-2.5 text-xs"
      >
        <Plus className="size-4" aria-hidden="true" />
        Increase
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onChange("base", "Text size reset to default")}
        disabled={textSize === "base"}
        className="flex-col gap-1 py-2.5 text-xs"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Reset
      </DropdownMenuItem>
    </div>
  );
}
