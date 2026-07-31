import { Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  variant?: "default" | "inverted";
  className?: string;
};

export function Logo({ href = "/", variant = "default", className }: LogoProps) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105",
          variant === "inverted"
            ? "bg-background text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <Layers className="size-5" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">e-Flash Cards</span>
    </Link>
  );
}
