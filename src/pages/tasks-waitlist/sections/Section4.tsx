/**
 * Section4 - Image carousel with scroll-driven grid animation.
 *
 * Three images animate through a 16-column CSS grid as the user scrolls.
 * Each image moves between "thumbnail" positions (corners) and a center
 * "hero" position. Text overlays appear alongside the centered image.
 *
 * Wide viewports: full grid animation with useImageTransform for
 * position interpolation.
 * Narrow viewports: simple stacked image cards.
 */

import React, { useRef, useMemo, useState, useLayoutEffect } from "react";
import { motion, useMotionValue, useTransform, useMotionTemplate, useMotionValueEvent } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useThemeValue } from "@/lib/theme";
import { useReducedMotion } from "@/lib/hooks";
import { defaultEasing } from "@/lib/easing";
import {
  CAROUSEL_KEYFRAMES as CK,
  IMAGE_BORDER_RADIUS,
  WIDE_MAX_WIDTH,
} from "../constants";
import { CAROUSEL_IMAGES, IMAGE_ANIMATION_CONFIGS } from "../data/carousel-configs";
import { useSectionContext } from "../context/SectionContext";
import { useLenisScrollContext } from "../context/LenisScrollContext";
import { StickyContainer } from "../components/StickyContainer";
import { useImageTransform } from "../hooks/useImageTransform";
import { useScrollProgress } from "../hooks/useScrollProgress";
import type { ImageTransform } from "../types";

// ===================== Main Component =====================

export function Section4() {
  const { scrollYProgress, sticky } = useSectionContext();
  const { isNarrow } = useLenisScrollContext();

  return (
    <StickyContainer
      sticky={sticky}
      height={isNarrow ? "auto" : "viewport"}
      className={
        isNarrow
          ? "pb-4 pt-16"
          : "overflow-hidden p-4 pb-[90px] sm:p-8 sm:pb-[126px]"
      }
    >
      {isNarrow ? (
        <NarrowCarousel />
      ) : (
        <WideCarousel scrollYProgress={scrollYProgress} />
      )}
    </StickyContainer>
  );
}

// ===================== Wide Carousel =====================

interface WideCarouselProps {
  scrollYProgress: MotionValue<number> | null;
}

function WideCarousel({ scrollYProgress }: WideCarouselProps) {
  const { t } = useTranslation();
  const theme = useThemeValue();
  const { isNarrow } = useLenisScrollContext();
  const isReducedMotion = useReducedMotion() === true;
  const fallback = useMotionValue(0);
  const rawProgress = scrollYProgress ?? fallback;

  // Remap scroll progress: dead zone for first 6%, then linear to 1
  const continuousProgress = useTransform(rawProgress, [0, 0.06, 1], [0, 0, 1]);

  // Reduced-motion: stepped progress that snaps between image positions
  const steppedProgress = useTransform(
    rawProgress,
    [0, 0.33, 0.33, 0.66, 0.66, 1],
    [0.2, 0.2, 0.55, 0.55, 0.85, 0.85],
  );

  // Choose progress source based on reduced motion preference
  const progress = isReducedMotion ? steppedProgress : continuousProgress;

  // Background opacity: constant 1 for narrow/reduced-motion, fade-in otherwise
  const staticOne = useMotionValue(1);
  const bgOpacityAnimated = useTransform(rawProgress, [0, 0.125], [0, 1]);
  const bgOpacity = isNarrow || isReducedMotion ? staticOne : bgOpacityAnimated;

  // Grid reference elements for position measurement
  const containerRef = useRef<HTMLDivElement>(null);
  const topLeftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const bottomMiddleRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);

  const sharedTransformOptions = {
    containerRef,
    topLeftRef,
    centerRef,
    bottomMiddleRef,
    bottomRightRef,
    scrollProgress: progress,
    isNarrow,
  };

  const imageTransforms = [
    useImageTransform({
      ...sharedTransformOptions,
      phases: IMAGE_ANIMATION_CONFIGS[0].phases,
    }),
    useImageTransform({
      ...sharedTransformOptions,
      phases: IMAGE_ANIMATION_CONFIGS[1].phases,
    }),
    useImageTransform({
      ...sharedTransformOptions,
      phases: IMAGE_ANIMATION_CONFIGS[2].phases,
    }),
  ];

  // Precompute image URLs based on theme
  const imageSrcs = useMemo(
    () =>
      CAROUSEL_IMAGES.map((img) =>
        theme === "dark" ? img.srcDark : img.srcLight,
      ),
    [theme],
  );

  // ---- Image preloading ----
  const [imagesLoaded, setImagesLoaded] = useState([false, false, false]);
  useLayoutEffect(() => {
    const cleanups: (() => void)[] = [];
    for (const idx of [0, 1, 2]) {
      const img = new Image();
      const onDone = () => {
        setImagesLoaded((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      };
      if (img.complete && img.naturalHeight !== 0) {
        onDone();
      } else {
        img.addEventListener("load", onDone);
        img.addEventListener("error", onDone);
        cleanups.push(() => {
          img.removeEventListener("load", onDone);
          img.removeEventListener("error", onDone);
        });
      }
      img.src = imageSrcs[idx]!;
    }
    return () => {
      for (const fn of cleanups) fn();
    };
  }, [imageSrcs]);

  // ---- Text overlay visibility tracking ----
  const tolerance = 0.02;
  const fadeDuration = 0.025;
  const [textVisible, setTextVisible] = useState([false, false, false]);

  useLayoutEffect(() => {
    const update = (p: number) => {
      const v1 =
        p >= CK.PART_1_HOLD_START - tolerance &&
        p <= CK.PART_2_TRANSITION_START + fadeDuration + tolerance;
      const v2 =
        p >= CK.PART_2_TRANSITION_END - tolerance &&
        p <= CK.PART_3_TRANSITION_START + fadeDuration + tolerance;
      const v3 = p >= CK.PART_3_TRANSITION_END - tolerance;
      setTextVisible((prev) => {
        if (prev[0] === v1 && prev[1] === v2 && prev[2] === v3) return prev;
        return [v1, v2, v3];
      });
    };
    update(progress.get());
    return progress.on("change", update);
  }, [progress]);

  return (
    <>
      {/* Background overlay */}
      <motion.div
        className="absolute inset-0 bg-background-150 will-change-[opacity] dark:bg-background-250"
        style={{ opacity: bgOpacity }}
      />

      <div className="relative flex size-full items-center justify-center">
        <div
          ref={containerRef}
          className={cn(
            "absolute grid size-full grid-cols-16 grid-rows-3 gap-6",
            WIDE_MAX_WIDTH,
          )}
        >
          {/* Invisible reference elements for position measurement */}
          <div
            ref={topLeftRef}
            className="pointer-events-none invisible hidden [grid-column:3/5] [grid-row:1] [@media(min-width:1024px)]:block"
            aria-hidden="true"
          />
          <div
            ref={centerRef}
            className="pointer-events-none invisible [grid-column:1/11] [grid-row:2] [@media(min-width:1024px)]:[grid-column:5/13]"
            aria-hidden="true"
          />
          <div
            ref={bottomMiddleRef}
            className="pointer-events-none invisible [grid-column:6/8] [grid-row:3]"
            aria-hidden="true"
          />
          <div
            ref={bottomRightRef}
            className="pointer-events-none invisible [grid-column:11/14] [grid-row:3] [@media(min-width:1024px)]:[grid-column:13/15]"
            aria-hidden="true"
          />

          {/* Animated images */}
          {IMAGE_ANIMATION_CONFIGS.map((config, index) => (
            <ImageOverlay
              key={config.imageId}
              config={config}
              imageSrc={imageSrcs[index]!}
              imageAlt={CAROUSEL_IMAGES[index]?.alt ?? ""}
              scrollYProgress={progress}
              transform={imageTransforms[index]!}
              isLoaded={imagesLoaded[index] ?? false}
              disableIntroOpacity={index < 2}
            />
          ))}

          {/* Text overlays - conditionally rendered */}
          {textVisible[0] && (
            <TextOverlay
              imageIndex={0}
              headline={t("tasks.waitList.section4.images.image1TextHeadline")}
              description={t("tasks.waitList.section4.images.image1TextDescription")}
              scrollYProgress={progress}
              fadeDuration={fadeDuration}
            />
          )}
          {textVisible[1] && (
            <TextOverlay
              imageIndex={1}
              headline={t("tasks.waitList.section4.images.image2TextHeadline")}
              description={t("tasks.waitList.section4.images.image2TextDescription")}
              scrollYProgress={progress}
              fadeDuration={fadeDuration}
            />
          )}
          {textVisible[2] && (
            <TextOverlay
              imageIndex={2}
              headline={t("tasks.waitList.section4.images.image3TextHeadline")}
              description={t("tasks.waitList.section4.images.image3TextDescription")}
              scrollYProgress={progress}
              fadeDuration={fadeDuration}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ===================== Image Overlay =====================

interface ImageOverlayProps {
  config: (typeof IMAGE_ANIMATION_CONFIGS)[number];
  imageSrc: string;
  imageAlt: string;
  scrollYProgress: MotionValue<number>;
  transform: ImageTransform;
  isLoaded: boolean;
  disableIntroOpacity?: boolean;
}

function ImageOverlay({
  config,
  imageSrc,
  imageAlt,
  scrollYProgress,
  transform,
  isLoaded,
  disableIntroOpacity = false,
}: ImageOverlayProps) {
  const { x, y, scale } = transform;

  // Inner scale (entry animation)
  const exitRange = config.exitScaleRange ?? [0, 0];
  const innerScaleInputs = config.exitScaleRange
    ? [config.innerScaleRange[0], config.innerScaleRange[1], exitRange[0], exitRange[1]]
    : [config.innerScaleRange[0], config.innerScaleRange[1], 1];
  const innerScaleOutputs = config.exitScaleRange
    ? [0, 1, 1, 0]
    : [0, 1, 1];
  const innerScale = useTransform(
    scrollYProgress,
    innerScaleInputs,
    innerScaleOutputs,
    { ease: defaultEasing },
  );

  // Opacity
  const opacityOutputs = disableIntroOpacity ? [1, 1, 1, 0] : [0, 1, 1, 0];
  const opacityInputs = disableIntroOpacity
    ? config.exitScaleRange
      ? [config.innerScaleRange[0], config.innerScaleRange[1], exitRange[0], exitRange[1]]
      : [config.innerScaleRange[0], config.innerScaleRange[1]]
    : config.exitScaleRange
      ? [config.innerScaleRange[0], config.innerScaleRange[1], exitRange[0], exitRange[1]]
      : [config.innerScaleRange[0], config.innerScaleRange[1]];
  const imgOpacity = useTransform(
    scrollYProgress,
    config.exitScaleRange
      ? [config.innerScaleRange[0], config.innerScaleRange[1], exitRange[0], exitRange[1]]
      : [config.innerScaleRange[0], config.innerScaleRange[1]],
    config.exitScaleRange
      ? (disableIntroOpacity ? [1, 1, 1, 0] : [0, 1, 1, 0])
      : (disableIntroOpacity ? [1, 1] : [0, 1]),
    { ease: defaultEasing },
  );

  // Image inner scale (zoom in effect that resolves to 1.15 max)
  const centerPhaseStart =
    config.phases.filter(
      (p) =>
        p.gridPosition.columnStart === 5 &&
        p.gridPosition.columnEnd === 13 &&
        p.gridPosition.rowStart === 2 &&
        p.endProgress > p.startProgress,
    )[0]?.startProgress ?? config.opacityRange[1];

  const imageScale = useTransform(
    scrollYProgress,
    [config.opacityRange[0], centerPhaseStart, config.opacityRange[3]],
    [1, 1, 1.15],
    { ease: defaultEasing },
  );

  // Z-index
  // Transform origin: starts at initial position origin, changes for exit
  const initialOrigin = useMemo(() => {
    const rowStart = config.phases[0]?.gridPosition.rowStart ?? -1;
    const colStart = config.phases[0]?.gridPosition.columnStart ?? -1;
    return rowStart === 2 && colStart === 5
      ? "origin-bottom"
      : "origin-bottom-right rtl:origin-bottom-left";
  }, [config]);

  const [transformOrigin, setTransformOrigin] = useState(initialOrigin);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!config.exitScaleRange) {
      if (transformOrigin !== initialOrigin) setTransformOrigin(initialOrigin);
      return;
    }
    const exitStart = config.exitScaleRange[0];
    const newOrigin =
      p < exitStart ? initialOrigin : "origin-top-left rtl:origin-top-right";
    if (newOrigin !== transformOrigin) setTransformOrigin(newOrigin);
  });

  // Build transform strings via useMotionTemplate
  const translateTransform = useMotionTemplate`translateX(${x}px) translateY(${y}px)`;
  const positionScaleTransform = useMotionTemplate`scale(${scale})`;
  const innerScaleTransform = useMotionTemplate`scale(${innerScale})`;
  const imageScaleTransform = useMotionTemplate`scale(${imageScale})`;

  // Dynamic border radius: IMAGE_BORDER_RADIUS / (positionScale * innerScale)
  const dynamicBorderRadius = useTransform(
    [scale, innerScale],
    (latest: number[]) => {
      const s = latest[0] ?? 1;
      const is = latest[1] ?? 1;
      const combined = s * is;
      if (combined < 0.01) return 0;
      return Math.min(Math.max(IMAGE_BORDER_RADIUS / combined, 0), 200);
    },
  );
  const borderRadiusPx = useMotionTemplate`${dynamicBorderRadius}px`;

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute will-change-transform",
        "[grid-column:1/11] [grid-row:1/4]",
        "[@media(min-width:1024px)]:[grid-column:5/13]",
      )}
      style={{
        width: "100%",
        height: "100%",
        transform: translateTransform,
      }}
    >
      <motion.div
        className="size-full will-change-transform"
        style={{ transform: positionScaleTransform, transformOrigin: "center center" }}
      >
        <motion.div
          className={cn(
            "relative size-full overflow-hidden bg-background-400/20 will-change-transform",
            !isLoaded && "animate-pulse",
            transformOrigin,
          )}
          style={{ transform: innerScaleTransform, borderRadius: borderRadiusPx }}
        >
          {isLoaded && (
            <motion.img
              src={imageSrc}
              alt={imageAlt}
              className="size-full object-cover will-change-[opacity]"
              style={{ opacity: imgOpacity, transform: imageScaleTransform }}
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ===================== Text Overlay =====================

interface TextOverlayProps {
  imageIndex: number;
  headline: string;
  description: string;
  scrollYProgress: MotionValue<number>;
  fadeDuration: number;
}

function TextOverlay({
  imageIndex,
  headline,
  description,
  scrollYProgress,
  fadeDuration,
}: TextOverlayProps) {
  let start: number;
  let end: number | undefined;

  if (imageIndex === 0) {
    start = CK.PART_1_HOLD_START;
    end = CK.PART_2_TRANSITION_START;
  } else if (imageIndex === 1) {
    start = CK.PART_2_TRANSITION_END;
    end = CK.PART_3_TRANSITION_START;
  } else {
    start = CK.PART_3_TRANSITION_END;
    end = undefined;
  }

  const opacity = useTransform(
    scrollYProgress,
    end !== undefined
      ? [start, start + fadeDuration, end, end + fadeDuration]
      : [start, start + fadeDuration],
    end !== undefined ? [0, 1, 1, 0] : [0, 1],
    { ease: defaultEasing },
  );

  return (
    <motion.div
      className={cn(
        "z-40 flex flex-col gap-3 [grid-column:11/17] [grid-row:2]",
        "[@media(min-width:1024px)]:[grid-column:13/17]",
        "[@media(max-height:800px)]:pt-6 [@media(max-height:800px)]:[grid-row:1]",
        "will-change-[opacity]",
      )}
      style={{ opacity }}
    >
      <div className="max-w-4xl text-foreground-800 text-lg-medium">
        {headline}
      </div>
      <div className="max-w-4xl text-foreground-450 text-base-dense dark:text-foreground-650">
        {description}
      </div>
    </motion.div>
  );
}

// ===================== Narrow Carousel =====================

function NarrowCarousel() {
  const { t } = useTranslation();
  const theme = useThemeValue();

  const imageSrcs = useMemo(
    () =>
      CAROUSEL_IMAGES.map((img) =>
        theme === "dark" ? img.srcDark : img.srcLight,
      ),
    [theme],
  );

  return (
    <>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background-150 dark:bg-background-250" />

      {/* Top gradient */}
      <div className="absolute top-0 h-64 w-full bg-gradient-to-b from-background-250 to-transparent" />

      <div className="relative flex flex-col gap-16 px-4">
        {CAROUSEL_IMAGES.map((image, index) => (
          <NarrowCard
            key={image.id}
            src={imageSrcs[index]!}
            altKey={`tasks.waitList.section4.images.image${index + 1}Alt`}
            headlineKey={`tasks.waitList.section4.images.image${index + 1}TextHeadline`}
            descriptionKey={`tasks.waitList.section4.images.image${index + 1}TextDescription`}
          />
        ))}
      </div>
    </>
  );
}

function NarrowCard({
  src,
  altKey,
  headlineKey,
  descriptionKey,
}: {
  src: string;
  altKey: string;
  headlineKey: string;
  descriptionKey: string;
}) {
  const { t } = useTranslation();
  const { lenisScroll } = useLenisScrollContext();
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScrollProgress({
    target: cardRef,
    offset: ["start end", "center center"],
    lenisScroll,
  });
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.75, 1]);

  return (
    <div
      ref={cardRef}
      className="grid grid-cols-6 grid-rows-[1fr_auto] gap-y-6"
    >
      <motion.img
        src={src}
        alt={t(altKey)}
        className="aspect-square w-full origin-bottom object-cover squircle-24 [grid-column:1/7] [grid-row:1]"
        style={{ scale: cardScale }}
      />
      <div className="flex flex-col gap-2 [grid-column:1/7] [grid-row:2]">
        <div className="text-foreground-800 text-lg-medium">
          {t(headlineKey)}
        </div>
        <div className="text-foreground-600 text-base-dense dark:text-foreground-650">
          {t(descriptionKey)}
        </div>
      </div>
    </div>
  );
}

