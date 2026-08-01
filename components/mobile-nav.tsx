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
import { logout } from "@/services/auth-service";
import type { SessionUser } from "@/types/auth";

type NavLink = { label: string; href: string };

/** Mobile slide-in navigation shown below the `md` breakpoint. */
export function MobileNav({
  links,
  user,
}: {
  links: readonly NavLink[];
  user: SessionUser | null;
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
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo />
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t px-4 py-4">
          {user ? (
            <>
              <p className="truncate px-3 text-sm text-muted-foreground">
                Signed in as {user.email}
              </p>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Dashboard
              </Link>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className={buttonVariants({ size: "sm" })}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
