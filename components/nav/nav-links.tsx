"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GraduationCap, Layers, LifeBuoy, ScrollText } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "/", match: "/" },
  { label: "Courses", href: "/courses", match: "/courses" },
  { label: "Progress", href: "/dashboard", match: "/dashboard" },
  { label: "About", href: "/#about", match: "/#about" },
  { label: "Contact", href: "/#contact", match: "/#contact" },
] as const;

const RESOURCES = [
  {
    label: "Learning Modules",
    href: "/courses",
    icon: GraduationCap,
  },
  {
    label: "Digital Reinforcement Cards",
    href: "/decks/reinforcement-rewards",
    icon: Layers,
  },
  {
    label: "Accessibility Guide",
    href: "/#accessibility",
    icon: ScrollText,
  },
  {
    label: "FAQs",
    href: "/#contact",
    icon: LifeBuoy,
  },
] as const;

const linkClasses =
  "relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-foreground after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  const isActive = (match: string) =>
    match === "/" ? pathname === "/" : pathname.startsWith(match);

  return (
    <nav
      aria-label="Main"
      className={cn(
        "mx-auto flex w-full max-w-6xl items-center justify-between gap-1 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.match) ? "page" : undefined}
            className={cn(
              linkClasses,
              isActive(link.match) && "text-foreground after:scale-x-100"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(linkClasses, "data-[popup-open]:text-foreground data-[popup-open]:after:scale-x-100")}
            >
              Resources
              <ChevronDown
                className="size-4 transition-transform duration-200 data-[popup-open]:rotate-180"
                aria-hidden="true"
              />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-60 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Resources</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {RESOURCES.map((resource) => (
            <DropdownMenuItem
              key={resource.href}
              render={
                <Link href={resource.href} className="min-h-11 w-full">
                  <resource.icon aria-hidden="true" />
                  {resource.label}
                </Link>
              }
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
