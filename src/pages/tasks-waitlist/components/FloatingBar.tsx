/**
 * FloatingBar - Fixed bottom pill with the Copilot Tasks logo and CTA button.
 *
 * Appears when section-2 scrolls past the viewport bottom and hides
 * when section-end reaches the viewport. Uses element-based scroll
 * tracking for precise show/hide logic.
 */

import React, { useReducer, useEffect, useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { defaultEasing } from "@/lib/easing";
import { SHOW_LOGO_ICON } from "../constants";
import { useLenisScrollContext } from "../context/useLenisScrollContext";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { CopilotTasksLogo } from "../icons";
import { WaitlistButton } from "./WaitlistButton";

export function FloatingBar({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { lenisScroll } = useLenisScrollContext();

  const debug = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("debugFloatingBar") === "1";
  }, []);

  // Progress values are floats; treat very small values as zero to avoid flicker.
  const EPS = 0.001;
  const isPositive = (v: number) => v > EPS;
  const isNearlyOne = (v: number) => v >= 1 - EPS;

  // Find section-2 and section-end DOM elements
  const [section2El, setSection2El] = useReducer(
    (_: Element | null, next: Element | null) => next,
    null,
  );
  const section2Ref = useMemo(() => ({ current: section2El }), [section2El]);

  const [sectionEndEl, setSectionEndEl] = useReducer(
    (_: Element | null, next: Element | null) => next,
    null,
  );
  const sectionEndRef = useMemo(() => ({ current: sectionEndEl }), [sectionEndEl]);

  useEffect(() => {
    const s2 = document.querySelector('[data-section-id="section-2"]');
    const se = document.querySelector('[data-section-id="section-end"]');
    setSection2El(s2);
    setSectionEndEl(se);
  }, []);

  // Track when section-2 end passes viewport
  const { scrollYProgress: s2Progress } = useScrollProgress({
    target: section2Ref as React.RefObject<HTMLElement>,
    offset: ["end end", "end center"],
    lenisScroll,
  });

  // Track when section-end is in view
  const { scrollYProgress: endProgress } = useScrollProgress({
    target: sectionEndRef as React.RefObject<HTMLElement>,
    offset: ["center end", "center start"],
    lenisScroll,
  });

  // Show when section-2 has scrolled past and section-end not yet in view
  const [visible, setVisible] = useReducer((_: boolean, next: boolean) => next, false);

  useEffect(() => {
    const update = () => {
      const s2 = s2Progress.get();
      const end = endProgress.get();
      // Keep the bar mounted until SectionEnd is fully in view.
      // SectionEnd should visually cover the bar (higher z-index), then we unmount.
      setVisible(isPositive(s2) && !isNearlyOne(end));

      if (debug) {
        console.log("[FloatingBar]", {
          section2Found: Boolean(section2El),
          sectionEndFound: Boolean(sectionEndEl),
          s2Progress: s2,
          endProgress: end,
          visible: isPositive(s2) && !isNearlyOne(end),
        });
      }
    };

    // Run once so we don't rely on the first change event.
    update();

    const unsub1 = s2Progress.on("change", update);
    const unsub2 = endProgress.on("change", update);
    return () => {
      unsub1();
      unsub2();
    };
  }, [s2Progress, endProgress]);

  const translateY = useTransform(s2Progress, [0, 0.5], [200, 0], {
    ease: defaultEasing,
  });

  if (!visible) return null;

  return (
    <motion.div
      className={cn(
        "fixed bottom-0 z-50 flex w-full items-center justify-center px-4",
        "pointer-events-none",
        className,
      )}
      style={{ y: translateY }}
    >
      <div
        className={cn(
          "shadow-tinted-lg pointer-events-auto relative flex flex-col rounded-full p-1.5",
          "mb-5 sm:mb-8",
          "bg-background-100 text-foreground-900 dark:bg-background-150",
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="flex shrink-0 items-center justify-center gap-1 px-2.5">
            {SHOW_LOGO_ICON}
            <div className="ms-1 mt-px shrink-0 pt-0.5">
              <CopilotTasksLogo className="h-[18px]" title={t("tasks.waitList.footer.title")} />
            </div>
          </div>
          <WaitlistButton placement="floating" />
        </div>
      </div>
    </motion.div>
  );
}
