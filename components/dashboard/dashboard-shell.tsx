"use client";

import { useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { AccessibilityPanel } from "@/components/dashboard/accessibility-panel";
import { AccessibilityProvider } from "@/providers/accessibility-provider";
import type { SessionUser } from "@/types/auth";

/**
 * Client shell for authenticated pages: collapsible sidebar, top header,
 * floating AI assistant, and the accessibility preferences sheet.
 */
export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  return (
    <AccessibilityProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar
          onOpenAI={() => setAiOpen(true)}
          onOpenAccessibility={() => setAccessibilityOpen(true)}
        />
        <SidebarInset>
          <DashboardHeader user={user} />
          {children}
        </SidebarInset>
        <AiAssistant open={aiOpen} onOpenChange={setAiOpen} />
        <AccessibilityPanel
          open={accessibilityOpen}
          onOpenChange={setAccessibilityOpen}
        />
      </SidebarProvider>
    </AccessibilityProvider>
  );
}
