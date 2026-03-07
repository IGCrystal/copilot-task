/**
 * SectionEnd - Final CTA section.
 *
 * A dark-themed section with the Copilot Tasks logo,
 * a closing headline, and the final waitlist CTA button.
 */

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useMotionValue } from "framer-motion";
import { CONTENT_MAX_WIDTH } from "../constants";
import { CopilotTasksLogo } from "../icons";
import { WaitlistButton } from "../components/WaitlistButton";
import { useLenisScrollContext } from "../context/LenisScrollContext";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useMotionValueEvent } from "framer-motion";

export function SectionEnd() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { lenisScroll } = useLenisScrollContext();

  const { scrollYProgress } = useScrollProgress({
    target: ref,
    offset: ["start end", "start start"],
    lenisScroll,
  });

  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setVisible(v > 0);
  });

  return (
    <div
      ref={ref}
      className="flex justify-center bg-background-150 px-4 dark:bg-background-250 sm:px-8"
    >
      <div
        className={cn(
          "flex w-full flex-col items-center gap-12 py-4 sm:pb-12",
          CONTENT_MAX_WIDTH,
        )}
      >
        {/* Dark card */}
        <div className="relative mt-8 flex h-[max(50vh,500px)] w-full flex-col items-center bg-background-800 px-4 squircle-24 dark:bg-background-100 sm:-mt-22 sm:px-8">
          <div className="relative flex size-full flex-col items-center justify-center gap-8 p-5 text-foreground-250 dark:text-foreground-650 md:gap-10">
            {/* Headline */}
            <div className="px-8 text-center text-xl sm:text-3xl md:text-4xl">
              {t("tasks.waitList.sectionEnd.headline")}
            </div>

            {/* Logo */}
            <div className="relative w-full px-4">
              <CopilotTasksLogo
                className="h-auto w-full"
                title={t("tasks.waitList.footer.title")}
              />
            </div>

            {/* CTA */}
            <div className="pointer-events-auto relative mt-4 min-h-14">
              {visible && <WaitlistButton placement="footer" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
