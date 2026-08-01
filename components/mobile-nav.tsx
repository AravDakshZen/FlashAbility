"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { label: string; href: string };
type NavLink = NavItem | { label: string; children: readonly NavItem[] };

function isSection(link: NavLink): link is { label: string; children: readonly NavItem[] } {
  return "children" in link;
}

export function MobileNav({
  links,
}: {
  links: readonly NavLink[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu />
          </Button>
        }
      />
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo />
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pt-4" aria-label="Mobile">
          {links.map((link) =>
            isSection(link) ? (
              <div key={link.label} className="mt-3">
                <p className="px-3 pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                  {link.label}
                </p>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t px-4 py-4">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Dashboard
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
