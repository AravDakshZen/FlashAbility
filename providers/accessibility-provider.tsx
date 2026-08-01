"use client";

import * as React from "react";

import {
  applyAccessibilityToHtml,
  DEFAULT_ACCESSIBILITY,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
  type AccessibilitySettings,
} from "@/lib/accessibility";

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  update: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  reset: () => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextValue | null>(
  null
);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lazy client init is hydration-safe: the provider renders only children,
  // and the no-flash inline script in layout.tsx already applied saved classes.
  const [settings, setSettings] = React.useState<AccessibilitySettings>(() => {
    if (typeof window === "undefined") return DEFAULT_ACCESSIBILITY;
    return loadAccessibilitySettings();
  });

  React.useEffect(() => {
    applyAccessibilityToHtml(settings);
  }, [settings]);

  const update = React.useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        applyAccessibilityToHtml(next);
        saveAccessibilitySettings(next);
        return next;
      });
    },
    []
  );

  const reset = React.useCallback(() => {
    setSettings((prev) => {
      applyAccessibilityToHtml(DEFAULT_ACCESSIBILITY);
      saveAccessibilitySettings(DEFAULT_ACCESSIBILITY);
      return { ...prev, ...DEFAULT_ACCESSIBILITY };
    });
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, update, reset }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = React.useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return ctx;
}
