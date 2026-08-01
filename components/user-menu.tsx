"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/services/auth-service";
import type { SessionUser } from "@/types/auth";
import { cn } from "@/lib/utils";

export function UserMenu({
  user,
  className,
}: {
  user: SessionUser;
  className?: string;
}) {
  const displayName =
    user.user_metadata?.name ??
    user.user_metadata?.full_name ??
    user.email ??
    "Signed in";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label={`Account menu for ${displayName}`}
            className={cn("h-9 rounded-full px-1.5", className)}
          >
            <Avatar className="size-8">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate font-medium text-foreground">
              {displayName}
            </span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user.email ?? "Signed in"}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem
            variant="destructive"
            nativeButton
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
