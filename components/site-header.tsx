import Link from "next/link";

import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav/nav-links";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { label: "Home", href: "/" },
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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Logo tagline className="shrink-0" />
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden min-h-11 sm:inline-flex"
              )}
            >
              Dashboard
            </Link>
            <MobileNav links={mobileLinks} />
          </div>
        </div>
      </div>

      <div className="hidden border-b bg-background md:block">
        <NavLinks />
      </div>
    </header>
  );
}
