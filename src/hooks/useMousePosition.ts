"use client";

import { useEffect, useRef } from "react";

export type MouseSide = "left" | "right";

/**
 * Returns a ref that always holds the current mouse side ("left" | "right").
 * Uses a ref (not state) to avoid re-renders on every mousemove.
 */
export function useMouseSide(): React.MutableRefObject<MouseSide> {
  const sideRef = useRef<MouseSide>("left");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      sideRef.current = e.clientX < window.innerWidth / 2 ? "left" : "right";
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return sideRef;
}
