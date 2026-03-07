/**
 * useOverflowDetection - Detect when content overflows its container.
 *
 * Compares the scrollWidth of childRef against the offsetWidth of
 * containerRef. Uses a threshold to trigger and hysteresis to prevent
 * rapid toggling near the boundary.
 */

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface UseOverflowDetectionOptions {
  containerRef: RefObject<HTMLElement | null>;
  childRef: RefObject<HTMLElement | null>;
  /** Fraction of container width at which content is considered overflowing (default: 0.9) */
  threshold?: number;
  /** Additional fraction above threshold to prevent toggling (default: 0.05) */
  hysteresis?: number;
}

export function useOverflowDetection({
  containerRef,
  childRef,
  threshold = 0.9,
  hysteresis = 0.05,
}: UseOverflowDetectionOptions): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const lastStateRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || !childRef.current) return;

    const container = containerRef.current;
    const child = childRef.current;

    const checkOverflow = () => {
      const containerWidth = container.offsetWidth;
      const childScrollWidth = child.scrollWidth;

      const triggerWidth = containerWidth * threshold;
      const resetWidth = containerWidth * (threshold + hysteresis);

      let shouldUpdate = false;
      let newState = lastStateRef.current;

      if (lastStateRef.current) {
        // Currently overflowing - check if we should reset
        if (childScrollWidth < resetWidth) {
          shouldUpdate = true;
          newState = false;
        }
      } else {
        // Not overflowing - check if we should trigger
        if (childScrollWidth >= triggerWidth) {
          shouldUpdate = true;
          newState = true;
        }
      }

      if (shouldUpdate) {
        // Debounce the state change to avoid rapid toggling
        if (debounceTimerRef.current !== null) {
          window.clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = window.setTimeout(() => {
          lastStateRef.current = newState;
          setIsOverflowing(newState);
          debounceTimerRef.current = null;
        }, 25);
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);
    observer.observe(child);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
      observer.disconnect();
    };
  }, [containerRef, childRef, threshold, hysteresis]);

  return isOverflowing;
}
