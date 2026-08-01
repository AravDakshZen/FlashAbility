"use client";

import { useCallback, useRef } from "react";

export function useAnnouncer() {
  const ref = useRef<HTMLParagraphElement>(null);
  const announce = useCallback((message: string) => {
    if (ref.current) ref.current.textContent = message;
  }, []);
  return { ref, announce };
}
