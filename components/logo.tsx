import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  variant?: "default" | "inverted";
  /** Shows the tagline beneath the wordmark (main header layout). */
  tagline?: boolean;
  className?: string;
};

/**
 * FlashAbility wordmark — monochrome "F" tile + name.
 * Server-component safe.
 */
export function Logo({
  href = "/",
  variant = "default",
  tagline = false,
  className,
}: LogoProps) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-bold transition-transform duration-200 group-hover:scale-[1.03]",
          variant === "inverted"
            ? "bg-background text-foreground"
            : "bg-foreground text-background"
        )}
        aria-hidden="true"
      >
        F
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight">
          FlashAbility
        </span>
        {tagline ? (
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            Accessible Digital Learning Platform
          </span>
        ) : null}
      </span>
    </Link>
  );
}
