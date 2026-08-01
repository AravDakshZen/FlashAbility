"use client";

import { useSyncExternalStore } from "react";

const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(MEDIA_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(MEDIA_QUERY).matches;
}

/**
 * Server and hydration snapshot: reduced motion is unknown until the client,
 * and both server and first client render must agree to avoid a mismatch.
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Returns whether the user prefers reduced motion, safely across hydration.
 *
 * `useReducedMotion()` returns `null` during SSR, so branching on it in the
 * first client render produces a React hydration mismatch (server renders the
 * animated markup, client with reduced motion renders the plain markup).
 * `useSyncExternalStore` renders the server snapshot until hydration is done,
 * then swaps in the real media-query value.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
