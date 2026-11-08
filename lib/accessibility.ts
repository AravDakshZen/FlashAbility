/**
 * Accessibility ("disability modes") settings.
 *
 * All settings are persisted to localStorage under a single key so the
 * provider can restore them before first paint (see the inline script in
 * `app/layout.tsx`) — no flash of the wrong mode.
 * end ;
 */

export const ACCESSIBILITY_STORAGE_KEY = "flashability:accessibility";

export type TextSize = "sm" | "base" | "lg" | "xl";
export type SpeechRate = "slow" | "normal" | "fast";

export interface AccessibilitySettings {
  textSize: TextSize;
  highContrast: boolean;
  dyslexiaMode: boolean;
  reduceMotion: boolean;
  speechRate: SpeechRate;
  autoRead: boolean;
}

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  textSize: "base",
  highContrast: false,
  dyslexiaMode: false,
  reduceMotion: false,
  speechRate: "normal",
  autoRead: false,
};

export const TEXT_SIZE_VALUES: Record<TextSize, string> = {
  sm: "sm",
  base: "base",
  lg: "lg",
  xl: "xl",
};

export const SPEECH_RATE_VALUES: Record<SpeechRate, number> = {
  slow: 0.75,
  normal: 1,
  fast: 1.25,
};

export const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  sm: "Small",
  base: "Medium",
  lg: "Large",
  xl: "Extra large",
};

export const SPEECH_RATE_LABELS: Record<SpeechRate, string> = {
  slow: "Slow",
  normal: "Normal",
  fast: "Fast",
};

export function loadAccessibilitySettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULT_ACCESSIBILITY;

  try {
    const raw = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return DEFAULT_ACCESSIBILITY;

    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return {
      ...DEFAULT_ACCESSIBILITY,
      ...parsed,
    };
  } catch {
    return DEFAULT_ACCESSIBILITY;
  }
}

export function saveAccessibilitySettings(
  settings: AccessibilitySettings
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Storage may be unavailable (private mode, quota) — fail silently.
  }
}

/**
 * Applies every mode to the <html> element. This is the single source of
 * truth for how settings affect the DOM; the provider and the no-flash
 * inline script both call it.
 */
export function applyAccessibilityToHtml(settings: AccessibilitySettings): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Text size — a data attribute drives the CSS scale in globals.css.
  root.dataset.textSize = TEXT_SIZE_VALUES[settings.textSize];

  root.classList.toggle("high-contrast", settings.highContrast);

  root.classList.toggle("dyslexia", settings.dyslexiaMode);

  // Forced reduced motion (in addition to `prefers-reduced-motion`).
  root.classList.toggle("force-reduce-motion", settings.reduceMotion);
}
