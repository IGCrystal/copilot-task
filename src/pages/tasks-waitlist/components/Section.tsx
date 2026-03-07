/**
 * Section - A scroll-tracked page section wrapper.
 *
 * Each major block of the waitlist page is wrapped in a <Section>.
 * It handles:
 * - Dynamic height based on viewport (heightMultiplier)
 * - Negative margins for overlapping sections
 * - z-index stacking
 * - Scroll progress tracking via useScrollProgress
 * - Providing SectionContext to children
 */

import React, { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/hooks";
import { HEADER_HEIGHT_OFFSET } from "../constants";
import { SECTION_CONFIGS, getEffectiveHeightMultiplier } from "../data/section-configs";
import { useLenisScrollContext } from "../context/LenisScrollContext";
import { SectionContext } from "../context/SectionContext";
import { useScrollProgress } from "../hooks/useScrollProgress";

interface SectionProps {
  children: React.ReactNode;
  heightMultiplier?: number;
  className?: string;
  sectionId?: string;
  enableScrollProgress?: boolean;
  scrollTrackingEdge?: [string, string];
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      heightMultiplier = 1,
      className,
      sectionId,
      enableScrollProgress = false,
      scrollTrackingEdge = ["top", "top"],
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    const { lenisScroll, isNarrow } = useLenisScrollContext();
    const shouldReduceMotion = useReducedMotion() === true;
    const { t } = useTranslation();

    // Find section config for overrides
    const sectionConfig = sectionId
      ? SECTION_CONFIGS.find((s) => s.id === sectionId)
      : undefined;

    const narrowOverrides = isNarrow ? sectionConfig?.narrowOverrides : undefined;
    const reducedMotionOverrides = shouldReduceMotion
      ? sectionConfig?.reducedMotionOverrides
      : undefined;

    // Compute effective height multiplier with overrides
    const effectiveMultiplier =
      reducedMotionOverrides?.heightMultiplier ??
      narrowOverrides?.heightMultiplier ??
      heightMultiplier;

    const overlapPrevious = sectionConfig?.overlapPrevious;
    const effectiveOverlap = narrowOverrides?.overlapPrevious ?? overlapPrevious;
    const stickyEnabled = narrowOverrides?.sticky ?? true;

    // Calculate previous section overlap height
    let previousSectionMultiplier = 1;
    let totalMultiplier = effectiveMultiplier;

    if (effectiveOverlap && sectionId) {
      const sectionIndex = SECTION_CONFIGS.findIndex((s) => s.id === sectionId);
      if (sectionIndex > 0) {
        for (let i = sectionIndex - 1; i >= 0; i--) {
          if (!SECTION_CONFIGS[i]?.hidden) {
            previousSectionMultiplier = getEffectiveHeightMultiplier(i);
            break;
          }
        }
        totalMultiplier = effectiveMultiplier + previousSectionMultiplier;
      }
    } else {
      totalMultiplier = effectiveMultiplier;
    }

    // Determine if this section has zero height (non-scrolling)
    const isZeroHeight = effectiveMultiplier === 0;

    // Calculate CSS min-height
    let minHeightStyle: string | undefined;
    if (!isZeroHeight && totalMultiplier !== 1) {
      minHeightStyle = `calc((100dvh - ${HEADER_HEIGHT_OFFSET}px) * ${totalMultiplier})`;
    }
    const minHeightClass =
      !isZeroHeight && totalMultiplier === 1
        ? "min-h-[100dvh] md:min-h-lenis-wrapper"
        : undefined;

    // Negative margin for overlap
    const marginTopStyle = effectiveOverlap
      ? `calc((100dvh - ${HEADER_HEIGHT_OFFSET}px) * -${previousSectionMultiplier})`
      : undefined;

    const zIndex = sectionConfig?.zIndex;
    const ariaLabel = sectionConfig?.ariaLabel;
    const ariaLabelText =
      typeof ariaLabel === "string" ? String(t(ariaLabel)) : undefined;

    // Compute scroll tracking offset strings
    const overlapFraction = effectiveOverlap
      ? previousSectionMultiplier / totalMultiplier
      : 0;
    const [startEdge, endEdge] = scrollTrackingEdge;

    const startEdgeName = startEdge === "top" ? "start" : "end";
    const endEdgeName = endEdge === "top" ? "start" : "end";

    const overlapPercent = overlapFraction * 100;
    const startOffset =
      effectiveOverlap && overlapFraction > 0
        ? `${overlapPercent}% ${startEdgeName}`
        : `start ${startEdgeName}`;
    const endOffset = `${(overlapFraction + (isZeroHeight ? 1 : effectiveMultiplier) / (totalMultiplier || 1)) * 100}% ${endEdgeName}`;

    const scrollOffset = useMemo<[string, string]>(
      () => [startOffset, endOffset],
      [startOffset, endOffset],
    );

    const { scrollYProgress } = useScrollProgress({
      target: internalRef,
      offset: scrollOffset,
      lenisScroll,
    });

    const sectionProgress = enableScrollProgress ? scrollYProgress : null;

    const contextValue = useMemo(
      () => ({ scrollYProgress: sectionProgress, sticky: stickyEnabled, sectionRef: internalRef }),
      [sectionProgress, stickyEnabled],
    );

    return (
      <SectionContext.Provider value={contextValue}>
        <section
          ref={internalRef}
          aria-label={ariaLabelText}
          tabIndex={-1}
          className={cn(
            "pointer-events-none relative select-text outline-none",
            minHeightClass,
            className,
          )}
          data-section-id={sectionId}
          style={{
            ...(marginTopStyle && { marginTop: marginTopStyle }),
            ...(minHeightStyle && { minHeight: minHeightStyle }),
            ...(zIndex !== undefined && { zIndex }),
          }}
        >
          {children}
        </section>
      </SectionContext.Provider>
    );
  },
);

Section.displayName = "Section";
