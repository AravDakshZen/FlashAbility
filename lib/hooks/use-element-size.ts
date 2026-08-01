"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Returns a ref + current content size of the element it's attached to.
 * Used to size flashcards to the space actually available, so quiz/learning
 * layouts fit the viewport without a scrollbar (growing/shrinking as needed).
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}
