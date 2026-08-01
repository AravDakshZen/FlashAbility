import Link from "next/link";

import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/supabase/dal";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

/** Sticky site-wide navigation. Renders auth state from the server session. */
export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} className="hidden md:inline-flex" />
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden md:inline-flex"
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden md:inline-flex"
                )}
              >
                Get Started
              </Link>
            </>
          )}
          <MobileNav links={navLinks} user={user} />
        </div>
      </div>
    </header>
  );
}
