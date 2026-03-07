/**
 * Section3 - Features timeline.
 *
 * A vertically scrolling feature list where each feature fades in/out
 * based on scroll progress. Each feature shows:
 * - A title
 * - A description
 * - Action badges (service/tool icons with labels)
 *
 * Features a header with headline + subtitle, a squircle background panel,
 * and a two-column layout with progress indicator circles and content.
 */

import React, { useId, useRef } from "react";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/hooks";
import { defaultEasing } from "@/lib/easing";
import { CONTENT_MAX_WIDTH } from "../constants";
import { FEATURE_ITEMS, FEATURE_SEGMENT_SIZE } from "../data/feature-items";
import { useSectionContext } from "../context/SectionContext";
import { useLenisScrollContext } from "../context/LenisScrollContext";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { StickyContainer } from "../components/StickyContainer";
import { ActionBadge } from "../components/ActionBadge";

// ===================== Main Component =====================

export function Section3() {
  const { scrollYProgress, sticky, sectionRef } = useSectionContext();
  const { isNarrow } = useLenisScrollContext();

  return (
    <StickyContainer
      sticky={sticky}
      height={isNarrow ? "auto" : "viewport"}
      className={cn(
        "flex w-full justify-center bg-background-250 px-4 pb-10 sm:px-8 sm:pb-0",
        !isNarrow && "size-full",
      )}
    >
      <Section3Content scrollYProgress={scrollYProgress} isNarrow={isNarrow} sectionRef={sectionRef} />
    </StickyContainer>
  );
}

// ===================== Content =====================

interface Section3ContentProps {
  scrollYProgress: MotionValue<number> | null;
  isNarrow: boolean;
  sectionRef: React.RefObject<HTMLElement | null>;
}

function Section3Content({ isNarrow, sectionRef }: Section3ContentProps) {
  const { t } = useTranslation();
  const { lenisScroll } = useLenisScrollContext();
  const shouldReduceMotion = useReducedMotion() === true;

  // Entry animation (start end -> start start) - uses the SECTION element ref
  const { scrollYProgress: entryProgress } = useScrollProgress({
    target: sectionRef as React.RefObject<HTMLElement>,
    offset: ["start end", "start start"],
    lenisScroll,
  });

  // Main scroll progress (start start -> end end) - for feature items
  const { scrollYProgress: mainProgress } = useScrollProgress({
    target: sectionRef as React.RefObject<HTMLElement>,
    offset: ["start start", "end end"],
    lenisScroll,
  });

  // Exit animation (end end -> end start)
  const { scrollYProgress: exitProgress } = useScrollProgress({
    target: sectionRef as React.RefObject<HTMLElement>,
    offset: ["end end", "end start"],
    lenisScroll,
  });

  const isNarrowOrReduced = isNarrow || shouldReduceMotion;

  // Background div opacity (fades in as exit happens)
  const staticZero = useMotionValue(0);
  const staticOne = useMotionValue(1);
  const bgOpacityAnimated = useTransform(exitProgress, [0, 1], [0, 1]);
  const bgOpacity = isNarrowOrReduced ? staticZero : bgOpacityAnimated;

  // Header animations
  const headerOpacityAnimated = useTransform(
    entryProgress,
    [0, 0.5],
    [0, 1],
    { ease: defaultEasing },
  );
  const headerOpacity = isNarrowOrReduced ? staticOne : headerOpacityAnimated;

  const headerScaleAnimated = useTransform(
    entryProgress,
    [0, 1],
    [0.8, 1],
    { ease: defaultEasing },
  );
  const headerScale = isNarrowOrReduced ? staticOne : headerScaleAnimated;

  // Content squircle opacity & y offset
  const contentOpacityAnimated = useTransform(
    entryProgress,
    [0, 0.5],
    [0, 1],
    { ease: defaultEasing },
  );
  const contentOpacity = isNarrowOrReduced ? staticOne : contentOpacityAnimated;

  const contentYStatic = useMotionValue("0dvh");
  const contentYAnimated = useTransform(
    entryProgress,
    [0.5, 1],
    ["25dvh", "0dvh"],
    { ease: defaultEasing },
  );
  const contentY = isNarrowOrReduced ? contentYStatic : contentYAnimated;

  return (
    <>
      {/* Background fade overlay */}
      <motion.div
        className="absolute inset-0 bg-background-150 will-change-[opacity] dark:bg-background-250"
        style={{ opacity: bgOpacity }}
      />

      {/* Main content */}
      <motion.div
        className={cn(
          "relative flex w-full flex-col items-center will-change-[opacity] sm:pb-[126px]",
          isNarrow ? "pb-6" : "pb-[90px]",
          CONTENT_MAX_WIDTH,
        )}
        style={{ opacity: staticOne }}
      >
        {/* Header */}
        <motion.div
          className={cn(
            "relative z-10 flex origin-bottom flex-col items-center gap-4 text-center will-change-[opacity,transform]",
            isNarrow ? "pb-22" : "py-12",
          )}
          style={{ opacity: headerOpacity, scale: headerScale }}
        >
          <h1 className="text-foreground-900 text-2xl-medium md:text-3xl">
            {t("tasks.waitList.section3.headerHeadline")}
          </h1>
          <p className="max-w-[95%] text-foreground-700 text-base-dense-medium md:max-w-[70%] md:text-md">
            {t("tasks.waitList.section3.headerSubtitle")}
          </p>
        </motion.div>

        {/* Feature items in squircle panel */}
        <motion.div
          className={cn(
            isNarrow
              ? "relative w-full bg-background-200 squircle-24 md:squircle-36"
              : "sticky top-0 size-full bg-background-200 squircle-24 md:squircle-36",
            CONTENT_MAX_WIDTH,
          )}
          style={{ opacity: contentOpacity, y: contentY }}
        >
          <div
            className={cn(
              "flex size-full flex-col items-center",
              isNarrow && "pt-16",
            )}
          >
            {FEATURE_ITEMS.map((feature, index) => (
              <FeatureItem
                key={index}
                feature={feature}
                index={index}
                totalItems={FEATURE_ITEMS.length}
                sectionProgress={mainProgress}
                isNarrow={isNarrow}
                shouldReduceMotion={shouldReduceMotion}
                t={t}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ===================== Feature Item =====================

interface FeatureItemProps {
  feature: (typeof FEATURE_ITEMS)[number];
  index: number;
  totalItems: number;
  sectionProgress: MotionValue<number>;
  isNarrow: boolean;
  shouldReduceMotion: boolean;
  t: (key: string) => string;
}

function FeatureItem({
  feature,
  index,
  totalItems,
  sectionProgress,
  isNarrow,
  shouldReduceMotion,
  t,
}: FeatureItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { lenisScroll } = useLenisScrollContext();

  // Per-item scroll progress for narrow mode
  const { scrollYProgress: itemProgress } = useScrollProgress({
    target: itemRef as React.RefObject<HTMLElement>,
    offset: ["end end", "start start"],
    lenisScroll,
  });

  // In narrow mode, use per-item progress; in desktop, use section-level progress
  const progress = isNarrow ? itemProgress : sectionProgress;

  const segmentSize = FEATURE_SEGMENT_SIZE;
  const segmentStart = index * segmentSize;
  const segmentEnd = (index + 1) * segmentSize;

  // Animation keyframes helper
  const getKeyframes = (offsets: {
    leadInOffset: number;
    entranceOffset: number;
    peakOffset: number;
    exitOffset: number;
    leadOutOffset: number;
  }) => {
    if (isNarrow) return [0, 0.2, 0.5, 0.8, 1];
    return [
      segmentStart + segmentSize * offsets.leadInOffset,
      segmentStart + segmentSize * offsets.entranceOffset,
      segmentStart + segmentSize * offsets.peakOffset,
      segmentStart + segmentSize * offsets.exitOffset,
      segmentEnd + segmentSize * offsets.leadOutOffset,
    ];
  };

  const timingOffsets = {
    leadInOffset: -0.5,
    entranceOffset: 0.15,
    peakOffset: 0.5,
    exitOffset: 1,
    leadOutOffset: 0.2,
  };

  // Indicator circle scale
  const indicatorScale = useTransform(
    progress,
    getKeyframes(timingOffsets),
    [1, 1.4, 1.4, 1.4, 1.4],
    { ease: defaultEasing },
  );

  // Indicator circle states
  // State 1: empty border - visible initially, fades at peak
  const borderOpacity = useTransform(
    progress,
    getKeyframes(timingOffsets),
    [1, 1, 0, 0, 0],
    { ease: defaultEasing },
  );

  // State 2: white + colored checkmark - active state
  const activeOpacity = useTransform(
    progress,
    getKeyframes(timingOffsets),
    [0, 0.8, 1, 1, 0],
    { ease: defaultEasing },
  );

  // State 3: bg-300 + muted checkmark - done/past state
  const doneOpacity = useTransform(
    progress,
    getKeyframes(timingOffsets),
    [0, 0, 0, 0, 0.35],
    { ease: defaultEasing },
  );

  // Content opacity
  const contentOpacity = useTransform(
    progress,
    getKeyframes(timingOffsets),
    [0.3, 1, 1, 1, 0.7],
    { ease: defaultEasing },
  );

  // Description opacity (fades in slightly later)
  const descOpacity = useTransform(
    progress,
    getKeyframes({ ...timingOffsets, entranceOffset: 0.35 }),
    [0, 1, 1, 1, 0.7],
    { ease: defaultEasing },
  );

  // Title scale
  const titleScale = useTransform(
    progress,
    getKeyframes(timingOffsets),
    [0.82, 1, 1, 1, 1],
    { ease: defaultEasing },
  );

  // Vertical position
  const yPercent = useTransform(
    progress,
    [0, 1],
    [index * 100, (index - totalItems) * 100],
  );

  // Always call hooks in a stable order; only conditionally *use* the value.
  const yValue = useMotionTemplate`${yPercent}%`;

  return (
    <motion.div
      ref={itemRef}
      className={cn(
        "w-full max-w-[min(768px,100%)] will-change-[opacity,transform] gpu-text",
        "flex justify-center gap-6 md:gap-8",
        "px-6 sm:px-8",
        isNarrow ? "relative" : "absolute top-[50%] min-h-52",
      )}
      style={isNarrow ? undefined : { y: yValue }}
    >
      {/* Left indicator column */}
      <div className="relative flex min-h-0 w-[56px] items-start justify-center">
        {/* Vertical line */}
        <div className="absolute flex size-full items-start justify-center">
          <div
            className={cn(
              "border-s border-s-foreground-300",
              index === totalItems - 1 ? "h-screen" : "h-full",
            )}
          />
        </div>
        {/* Circle indicator */}
        <motion.div
          className="relative mt-1 size-6 rounded-full bg-white will-change-transform dark:bg-background-150 md:mt-0 md:size-8"
          style={{ scale: indicatorScale }}
        >
          {/* State 1: Empty border circle */}
          <motion.div
            className="absolute inset-0 rounded-full border border-foreground-350 bg-background-200 will-change-[opacity]"
            style={{ opacity: borderOpacity }}
          />
          {/* State 2: White circle with colored checkmark (active) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-white will-change-[opacity] dark:bg-background-150"
            style={{ opacity: activeOpacity }}
          >
            <CheckCircleColorDark className="size-8 shrink-0 dark:hidden md:size-10" />
            <CheckCircleColorLight className="hidden size-8 shrink-0 dark:block md:size-10" />
          </motion.div>
          {/* State 3: Muted circle with gray checkmark (done) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-background-300 will-change-[opacity]"
            style={{ opacity: doneOpacity }}
          >
            <CheckCircleMono className="size-8 shrink-0 text-foreground-400 dark:text-foreground-600 md:size-10" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right content column */}
      <motion.div
        className={cn(
          "w-full origin-left flex-col pt-0.5 will-change-[opacity] md:pt-0 rtl:origin-right",
          isNarrow && "pb-16",
        )}
        style={{ opacity: contentOpacity }}
      >
        <motion.h1
          className="w-full origin-left will-change-transform text-lg-medium gpu-text md:text-xl rtl:origin-right"
          style={{ scale: shouldReduceMotion || isNarrow ? undefined : titleScale }}
        >
          {t(feature.titleKey)}
        </motion.h1>
        <motion.div
          className="flex flex-col gap-4 pt-1.5 will-change-[opacity]"
          style={{ opacity: descOpacity }}
        >
          <div className="text-base-dense sm:line-clamp-2">
            {t(feature.descriptionKey)}
          </div>
          <div className="flex flex-wrap gap-2">
            {feature.actionItems.map((action, ai) => (
              <ActionBadge
                key={ai}
                labelKey={action.labelKey}
                icon={action.icon}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ===================== Checkmark Icons =====================

const CHECK_PATH =
  "M13.8327 7.17556C14.031 7.38364 14.053 7.70664 13.8988 7.94025L13.8327 8.02327L9.25894 12.8244C9.06071 13.0325 8.75301 13.0556 8.53046 12.8938L8.45138 12.8244L6.16725 10.4268C5.94425 10.1927 5.94425 9.81315 6.16725 9.57907C6.36547 9.37099 6.67317 9.34787 6.89573 9.50971L6.97481 9.57907L8.85516 11.5532L13.0252 7.17556C13.2482 6.94148 13.6097 6.94148 13.8327 7.17556Z";

function CheckCircleMono({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5Z"
        stroke="currentColor"
      />
      <path d={CHECK_PATH} fill="currentColor" />
    </svg>
  );
}

function CheckCircleColorLight({ className }: { className?: string }) {
  // NOTE: React 18 useId() includes ':' characters (e.g. ":r0:").
  // Some browsers / SVG url(#id) resolvers are picky about special chars,
  // which can cause gradients/clipPaths to fail silently.
  // The original implementation used a random [a-z0-9] id, so we normalize here.
  const reactId = useId();
  const id = `check-circle-color-light-${reactId.replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g clipPath={`url(#${id}-clip)`}>
        <path
          opacity={0.5}
          d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2Z"
          fill="#0C5D2A"
        />
        <path
          opacity={0.4}
          d="M10 2.25C14.2802 2.25 17.75 5.71979 17.75 10C17.75 14.2802 14.2802 17.75 10 17.75C5.71979 17.75 2.25 14.2802 2.25 10C2.25 5.71979 5.71979 2.25 10 2.25Z"
          stroke={`url(#${id}-grad)`}
          strokeWidth={0.5}
        />
        <path d={CHECK_PATH} fill="#272320" />
        <path d={CHECK_PATH} fill="#63F092" />
      </g>
      <defs>
        <linearGradient
          id={`${id}-grad`}
          x1={10} y1={2} x2={10} y2={18}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6CCF90" />
          <stop offset={1} stopColor="#4AA46B" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width={20} height={20} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function CheckCircleColorDark({ className }: { className?: string }) {
  const reactId = useId();
  const id = `check-circle-color-dark-${reactId.replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g clipPath={`url(#${id}-clip)`}>
        <path
          d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2Z"
          fill="#C8E8D4"
        />
        <path
          d="M10 2.25C14.2802 2.25 17.75 5.71979 17.75 10C17.75 14.2802 14.2802 17.75 10 17.75C5.71979 17.75 2.25 14.2802 2.25 10C2.25 5.71979 5.71979 2.25 10 2.25Z"
          stroke={`url(#${id}-grad)`}
          strokeWidth={0.5}
        />
        <path d={CHECK_PATH} fill="#272320" />
        <path d={CHECK_PATH} fill="#0D682B" />
      </g>
      <defs>
        <linearGradient
          id={`${id}-grad`}
          x1={10} y1={2} x2={10} y2={18}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6CCF90" />
          <stop offset={1} stopColor="#4AA46B" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width={20} height={20} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
