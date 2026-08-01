"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/services/auth-service";
import type { SessionUser } from "@/types/auth";
import { cn } from "@/lib/utils";

/** Avatar dropdown shown in the site header when a user is signed in. */
export function UserMenu({
  user,
  className,
}: {
  user: SessionUser;
  className?: string;
}) {
  const initial = user.email?.trim().charAt(0).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label="Account menu"
            className={cn("h-9 rounded-full px-1.5", className)}
          >
            <Avatar className="size-8">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate font-medium text-foreground">
            {user.email}
          </span>
          <span className="block text-xs font-normal text-muted-foreground">
            Signed in
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" className="w-full" />}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
