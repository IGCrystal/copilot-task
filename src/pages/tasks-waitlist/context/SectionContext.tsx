/**
 * Section Context
 *
 * Provides scroll progress and sticky state for the current section.
 * Each <Section> wraps its children in this context so inner components
 * can access section-level scroll progress.
 */

import { createContext, useContext, createRef } from "react";
import type { SectionContextValue } from "../types";

const defaultRef = createRef<HTMLElement>();

export const SectionContext = createContext<SectionContextValue>({
  scrollYProgress: null,
  sticky: true,
  sectionRef: defaultRef,
});

/**
 * Access the scroll progress and sticky state of the enclosing section.
 */
export function useSectionContext(): SectionContextValue {
  return useContext(SectionContext);
}
