/**
 * Lenis Scroll Context
 *
 * Provides smooth scrolling state (Lenis instance, scroll position,
 * progress, direction) and viewport dimensions to all child components.
 */

import React, { createContext, useContext, useMemo } from "react";
import type { MotionValue } from "framer-motion";
import type { LenisScrollContextValue, LenisInstance } from "../types";

const LenisScrollContext = createContext<LenisScrollContextValue | null>(null);

/**
 * Access the Lenis scroll context. Must be used within a LenisScrollProvider.
 * @throws Error if used outside of provider
 */
export function useLenisScrollContext(): LenisScrollContextValue {
  const context = useContext(LenisScrollContext);
  if (!context) {
    throw new Error("useLenisScrollContext must be used within a LenisScrollProvider");
  }
  return context;
}

// ===================== Provider =====================

interface LenisScrollProviderProps {
  lenisScroll: MotionValue<number>;
  lenisProgress: MotionValue<number>;
  lenis: LenisInstance | null;
  lenisDirection: MotionValue<number>;
  viewportHeight: number;
  viewportWidth: number;
  isNarrow: boolean;
  children: React.ReactNode;
}

export function LenisScrollProvider({
  lenisScroll,
  lenisProgress,
  lenis,
  lenisDirection,
  viewportHeight,
  viewportWidth,
  isNarrow,
  children,
}: LenisScrollProviderProps) {
  const value = useMemo(
    () => ({
      lenisScroll,
      lenisProgress,
      lenis,
      lenisDirection,
      viewportHeight,
      viewportWidth,
      isNarrow,
    }),
    [lenisScroll, lenisProgress, lenis, lenisDirection, viewportHeight, viewportWidth, isNarrow],
  );

  return <LenisScrollContext.Provider value={value}>{children}</LenisScrollContext.Provider>;
}
