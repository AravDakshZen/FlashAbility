"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Trophy,
  Award,
  Bot,
  Accessibility,
  Settings,
  LifeBuoy,
  LogOut,
  Layers,
} from "lucide-react";
import { logout } from "@/services/auth-service";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "My Progress", href: "/dashboard#progress", icon: TrendingUp },
  { label: "Leaderboard", href: "/dashboard#leaderboard", icon: Trophy },
  { label: "Achievements", href: "/dashboard#achievements", icon: Award },
] as const;

const TOOL_ITEMS = [
  { label: "AI Assistant", icon: Bot, action: "ai" },
  { label: "Accessibility", icon: Accessibility, action: "accessibility" },
  { label: "Settings", href: "/dashboard#settings", icon: Settings },
  { label: "Help", href: "/dashboard#help", icon: LifeBuoy },
] as const;

function SidebarLogo() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Link
      href="/dashboard"
      className="flex h-10 items-center gap-2.5 rounded-md px-2 outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
        <Layers className="size-4" aria-hidden="true" />
      </span>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15 }}
          className="truncate text-sm font-semibold tracking-tight"
        >
          FlashAbility
        </motion.span>
      )}
    </Link>
  );
}

export function AppSidebar({
  onOpenAI,
  onOpenAccessibility,
}: {
  onOpenAI: () => void;
  onOpenAccessibility: () => void;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (href: string) => {
    const [path, hash] = href.split("#");
    if (hash) return pathname === path && window.location.hash === `#${hash}`;
    return pathname === path;
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarLogo />
        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={collapsed ? item.label : undefined}
                      className={cn(
                        active &&
                          "bg-foreground! text-background! hover:bg-foreground! hover:text-background!"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarMenu>
            {TOOL_ITEMS.map((item) => (
              <SidebarMenuItem key={item.label}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {"action" in item ? (
                    <SidebarMenuButton
                      onClick={
                        item.action === "ai" ? onOpenAI : onOpenAccessibility
                      }
                      tooltip={collapsed ? item.label : undefined}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive(item.href)}
                      tooltip={collapsed ? item.label : undefined}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </motion.div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <form action={logout}>
          <SidebarMenu>
            <SidebarMenuItem>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <SidebarMenuButton
                  tooltip={collapsed ? "Logout" : undefined}
                  className="text-muted-foreground hover:text-destructive data-active:text-destructive"
                >
                  <LogOut className="size-4 shrink-0" aria-hidden="true" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
