/**
 * useImageTransform - Compute animated x/y/scale for carousel images.
 *
 * Given a set of "phases" (grid positions the image moves through),
 * this hook measures the actual pixel positions of reference DOM elements
 * and interpolates the image's transform between them based on scroll progress.
 *
 * The result is a set of MotionValues (x, y, scale) that can be applied
 * directly to framer-motion components.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type { ImageAnimationPhase, ImageTransform } from "../types";
import { defaultEasing } from "../constants";
import { useResizeObserver } from "@/lib/hooks";

interface MeasuredPosition {
  x: number;
  y: number;
  scale: number;
}

interface UseImageTransformOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  /** Reference element for the "top-left" grid position */
  topLeftRef: React.RefObject<HTMLElement | null>;
  /** Reference element for the "center" grid position (the hero slot) */
  centerRef: React.RefObject<HTMLElement | null>;
  /** Reference element for the "bottom-middle" grid position */
  bottomMiddleRef: React.RefObject<HTMLElement | null>;
  /** Reference element for the "bottom-right" grid position */
  bottomRightRef: React.RefObject<HTMLElement | null>;
  /** The animation phases this image goes through */
  phases: ImageAnimationPhase[];
  /** The scroll progress driving the animation */
  scrollProgress: MotionValue<number>;
  gridConfig?: { columns: number; gap: number };
  isNarrow: boolean;
}

export function useImageTransform({
  containerRef,
  topLeftRef,
  centerRef,
  bottomMiddleRef,
  bottomRightRef,
  phases,
  scrollProgress,
  gridConfig = { columns: 16, gap: 24 },
  isNarrow,
}: UseImageTransformOptions): ImageTransform {
  const [measuredPositions, setMeasuredPositions] = useState<MeasuredPosition[]>([]);

  // Track DOM elements
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const [topLeftEl, setTopLeftEl] = useState<HTMLElement | null>(null);
  const [centerEl, setCenterEl] = useState<HTMLElement | null>(null);
  const [bottomMiddleEl, setBottomMiddleEl] = useState<HTMLElement | null>(null);
  const [bottomRightEl, setBottomRightEl] = useState<HTMLElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
  }, []);

  // Keep refs to latest values to avoid stale closures
  const phasesRef = useRef(phases);
  const gridConfigRef = useRef(gridConfig);

  useEffect(() => {
    setContainerEl(containerRef.current);
    setTopLeftEl(topLeftRef.current);
    setCenterEl(centerRef.current);
    setBottomMiddleEl(bottomMiddleRef?.current ?? null);
    setBottomRightEl(bottomRightRef.current);
  }, [containerRef, topLeftRef, centerRef, bottomMiddleRef, bottomRightRef, isNarrow]);

  useLayoutEffect(() => {
    phasesRef.current = phases;
    gridConfigRef.current = gridConfig;
  }, [phases, gridConfig]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Measurement function
  const measureRef = useRef(() => {});
  measureRef.current = () => {
    if (!topLeftEl || !centerEl || !bottomRightEl) return;

    const containerRect = containerEl?.getBoundingClientRect();
    if (!containerRect) return;
    // During breakpoint switches / resize, layout can temporarily report 0 sizes.
    // Avoid producing NaN/Infinity MotionValues (which can crash framer-motion).
    if (containerRect.width <= 0 || containerRect.height <= 0) return;

    const topLeftRect = topLeftEl.getBoundingClientRect();
    const centerRect = centerEl.getBoundingClientRect();
    const bottomMiddleRect = bottomMiddleEl?.getBoundingClientRect();
    const bottomRightRect = bottomRightEl.getBoundingClientRect();

    if (centerRect.width <= 0 || centerRect.height <= 0) return;

    // Convert to container-relative coordinates
    const topLeft = {
      x: topLeftRect.left - containerRect.left,
      y: topLeftRect.top - containerRect.top,
      width: topLeftRect.width,
      height: topLeftRect.height,
    };
    const center = {
      x: centerRect.left - containerRect.left,
      y: centerRect.top - containerRect.top,
      width: centerRect.width,
      height: centerRect.height,
    };
    const bottomMiddle = bottomMiddleRect
      ? {
          x: bottomMiddleRect.left - containerRect.left,
          y: bottomMiddleRect.top - containerRect.top,
          width: bottomMiddleRect.width,
          height: bottomMiddleRect.height,
        }
      : null;
    const bottomRight = {
      x: bottomRightRect.left - containerRect.left,
      y: bottomRightRect.top - containerRect.top,
      width: bottomRightRect.width,
      height: bottomRightRect.height,
    };

    let hadInvalidMeasurement = false;

    const positions = phasesRef.current.map((phase) => {
      const { rowStart, columnStart } = phase.gridPosition;

      // Determine which reference position this phase targets
      let targetRect: typeof topLeft;
      if (rowStart === 1) {
        targetRect = topLeft;
      } else if (rowStart === 3) {
        targetRect = columnStart === 6 && bottomMiddle ? bottomMiddle : bottomRight;
      } else {
        targetRect = center;
      }

      // Calculate scale relative to center (the hero position)
      // If a target rect is temporarily 0-sized (e.g. during responsive relayout),
      // keep the previous measurement instead of emitting NaN/Infinity.
      if (targetRect.width <= 0 || targetRect.height <= 0) {
        hadInvalidMeasurement = true;
        return { x: 0, y: 0, scale: 1 };
      }

      const scaleFactor = targetRect.width / center.width;
      if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
        hadInvalidMeasurement = true;
        return { x: 0, y: 0, scale: 1 };
      }

      // Calculate offset from center
      const xOffset = targetRect.x - center.x + (center.width * (scaleFactor - 1)) / 2;

      let yOffset = targetRect.y - center.y;
      const adjustmentDivisor = isDesktop ? 5 : 10;

      if (rowStart === 1) {
        yOffset -= (targetRect.height * (1 - scaleFactor)) / adjustmentDivisor;
      } else if (rowStart === 3) {
        yOffset += (targetRect.height * (1 - scaleFactor)) / adjustmentDivisor;
      }

      const result = { x: xOffset, y: yOffset, scale: scaleFactor };
      if (
        !Number.isFinite(result.x) ||
        !Number.isFinite(result.y) ||
        !Number.isFinite(result.scale)
      ) {
        hadInvalidMeasurement = true;
        return { x: 0, y: 0, scale: 1 };
      }

      return result;
    });

    // If any phase had to fall back, keep output stable by not updating with partial junk.
    // This avoids sudden disappears during breakpoint transitions.
    if (hadInvalidMeasurement) return;

    setMeasuredPositions(positions);
  };

  const measure = useCallback(() => {
    measureRef.current();
  }, []);

  // Measure when elements are available
  useEffect(() => {
    if (topLeftEl && centerEl && bottomRightEl) {
      measure();
    }
  }, [topLeftEl, centerEl, bottomRightEl, containerEl, isDesktop]);

  // Re-measure on resize via ResizeObserver
  useResizeObserver(
    () => {
      measure();
    },
    { initialize: false },
    containerEl,
  );

  // Build interpolation input/output arrays from phases and measured positions
  const progressBreakpoints = useMemo(() => {
    const points: number[] = [];
    for (const phase of phases) {
      points.push(phase.startProgress, phase.endProgress);
    }
    return points;
  }, [phases]);

  const xOutputValues = useMemo(() => {
    if (measuredPositions.length === 0) return progressBreakpoints.map(() => 0);
    const values: number[] = [];
    for (const [i, pos] of measuredPositions.entries()) {
      const prevX = i === 0 ? pos.x : (measuredPositions[i - 1]?.x ?? pos.x);
      values.push(prevX, pos.x);
    }
    return values;
  }, [measuredPositions, progressBreakpoints]);

  const yOutputValues = useMemo(() => {
    if (measuredPositions.length === 0) return progressBreakpoints.map(() => 0);
    const values: number[] = [];
    for (const [i, pos] of measuredPositions.entries()) {
      const prevY = i === 0 ? pos.y : (measuredPositions[i - 1]?.y ?? pos.y);
      values.push(prevY, pos.y);
    }
    return values;
  }, [measuredPositions, progressBreakpoints]);

  const scaleOutputValues = useMemo(() => {
    if (measuredPositions.length === 0) return progressBreakpoints.map(() => 1);
    const values: number[] = [];
    for (const [i, pos] of measuredPositions.entries()) {
      const prevScale = i === 0 ? pos.scale : (measuredPositions[i - 1]?.scale ?? pos.scale);
      values.push(prevScale, pos.scale);
    }
    return values;
  }, [measuredPositions, progressBreakpoints]);

  // Create interpolated motion values
  const x = useTransform(scrollProgress, progressBreakpoints, xOutputValues, {
    ease: defaultEasing,
  });
  const y = useTransform(scrollProgress, progressBreakpoints, yOutputValues, {
    ease: defaultEasing,
  });
  const scale = useTransform(scrollProgress, progressBreakpoints, scaleOutputValues, {
    ease: defaultEasing,
  });

  return { x, y, scale };
}
