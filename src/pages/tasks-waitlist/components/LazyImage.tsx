/**
 * LazyImage - Image with loading skeleton and error fallback.
 *
 * Shows an animated pulse skeleton while loading, fades in the image
 * when loaded, and falls back to the skeleton on error.
 *
 * MotionImage variant wraps the image in a framer-motion component
 * for animated styles (opacity, scale, etc.).
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MotionStyle } from "framer-motion";

// ===================== LazyImage (Static) =====================

interface LazyImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LazyImage({ src, alt, className, style }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // No source or load error: show skeleton
  if (!src || hasError) {
    return <div className={cn(className, "animate-pulse bg-background-200")} />;
  }

  return (
    <>
      {/* Skeleton placeholder while loading */}
      {!isLoaded && (
        <div className={cn(className, "animate-pulse bg-background-200")} />
      )}

      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          ...style,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  );
}

// ===================== MotionImage (Animated) =====================

interface MotionImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  style?: MotionStyle;
}

export function MotionImage({ src, alt, className, style }: MotionImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // No source or load error: show skeleton
  if (!src || hasError) {
    return <div className={cn(className, "animate-pulse bg-background-200")} />;
  }

  // Still loading: show skeleton + hidden img for load detection
  if (!isLoaded) {
    return (
      <>
        <div className={cn(className, "animate-pulse bg-background-200")} />
        <motion.img
          src={src}
          alt={alt}
          className="sr-only"
          style={style}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </>
    );
  }

  // Loaded: render the animated image
  return <motion.img src={src} alt={alt} className={className} style={style} />;
}
