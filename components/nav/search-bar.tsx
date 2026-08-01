"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Pill search bar. Ctrl+K (or Cmd+K) focuses it; submitting routes to
 * the deck library with a `?query=` filter.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/decks?query=${encodeURIComponent(query)}` : "/decks");
  }

  return (
    <form role="search" onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search flashcards, speech modules…"
        aria-label="Search flashcards and speech modules"
        enterKeyHint="search"
        className="h-11 rounded-full border-border/70 bg-muted/60 pr-16 pl-10 shadow-none transition-all duration-300 focus-visible:border-foreground/30 focus-visible:bg-background focus-visible:shadow-md"
      />
      <kbd
        className={cn(
          "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground transition-opacity duration-200",
          focused && "opacity-0"
        )}
        aria-hidden="true"
      >
        Ctrl K
      </kbd>
    </form>
  );
}
