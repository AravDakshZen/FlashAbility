import Link from "next/link";

import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { AccessibilityMenu } from "@/components/nav/accessibility-menu";
import { NavLinks } from "@/components/nav/nav-links";
import { SearchBar } from "@/components/nav/search-bar";
import { UserMenu } from "@/components/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/supabase/dal";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "Flashcards", href: "/decks" },
  { label: "Courses", href: "/courses" },
  { label: "Progress", href: "/dashboard" },
  {
    label: "Resources",
    children: [
      { label: "Learning Modules", href: "/courses" },
      { label: "Digital Reinforcement Cards", href: "/decks/reinforcement-rewards" },
      { label: "Accessibility Guide", href: "/#accessibility" },
      { label: "FAQs", href: "/#contact" },
    ],
  },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

const utilityLinkClasses =
  "inline-flex min-h-9 items-center rounded-md px-2.5 text-xs font-medium text-white/90 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-3 focus-visible:ring-white/50";

/**
 * Premium two-bar site header (black utility bar + white main bar)
 * with a navigation links row. Renders auth state from the server session.
 */
export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="bg-black text-white">
        <div className="mx-auto flex h-9 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p className="truncate text-xs font-semibold tracking-wide">
            FlashAbility
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <AccessibilityMenu variant="utility" />
            <span className="mx-1 h-3.5 w-px bg-white/25" aria-hidden="true" />
            {user ? (
              <>
                <Link href="/dashboard" className={utilityLinkClasses}>
                  Dashboard
                </Link>
                <span className="hidden text-xs text-white/40 sm:inline">
                  {user.email}
                </span>
              </>
            ) : (
              <>
                <Link href="/login" className={utilityLinkClasses}>
                  Login
                </Link>
                <Link href="/signup" className={utilityLinkClasses}>
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Logo tagline className="shrink-0" />
          <SearchBar className="hidden max-w-xl flex-1 lg:block" />
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <AccessibilityMenu className="hidden sm:inline-flex" />
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "hidden min-h-11 sm:inline-flex"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "hidden min-h-11 sm:inline-flex"
                  )}
                >
                  Signup
                </Link>
              </>
            )}
            <MobileNav links={mobileLinks} user={user} />
          </div>
        </div>
      </div>

      {/* Navigation links row */}
      <div className="hidden border-b bg-background md:block">
        <NavLinks />
      </div>
    </header>
  );
}
