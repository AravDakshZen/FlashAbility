"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Play,
  TrendingUp,
  Trophy,
  Award,
  Settings,
  LifeBuoy,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { courses } from "@/lib/data/dashboard";

const NAV_COMMANDS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Learn", href: "/learn", icon: Play },
  { label: "My Progress", href: "/dashboard#progress", icon: TrendingUp },
  { label: "Leaderboard", href: "/dashboard#leaderboard", icon: Trophy },
  { label: "Achievements", href: "/dashboard#achievements", icon: Award },
  { label: "Settings", href: "/dashboard#settings", icon: Settings },
  { label: "Help", href: "/dashboard#help", icon: LifeBuoy },
];

/** Global command palette (Ctrl+K) for searching courses and jumping to pages. */
export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  function runAction(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search FlashAbility">
      <CommandInput placeholder="Search courses, lessons, flashcards..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Courses">
          {courses.slice(0, 6).map((course) => (
            <CommandItem
              key={course.slug}
              value={`${course.name} ${course.category}`}
              onSelect={() => runAction(`/courses/${course.slug}`)}
            >
              <BookOpen className="size-4 shrink-0" aria-hidden="true" />
              {course.name}
              <CommandShortcut>{course.difficulty}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {NAV_COMMANDS.map((cmd) => (
            <CommandItem
              key={cmd.href}
              value={cmd.label}
              onSelect={() => runAction(cmd.href)}
            >
              <cmd.icon className="size-4 shrink-0" aria-hidden="true" />
              {cmd.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export { CommandMenu as default };
