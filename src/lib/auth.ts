/**
 * Mock: Authentication hooks.
 * Always returns "not authenticated" state for preview.
 */

import { useCallback, useMemo } from "react";

export function useIsAuthenticated(): boolean {
  // Keep this as a hook-shaped API for easy swapping with a real auth implementation later.
  return useMemo(() => false, []);
}

export function useSignIn(options: {
  from: string;
  scenario: string;
  loginScenario: string;
}): () => void {
  const { from, scenario, loginScenario } = options;
  return useCallback(() => {
    console.log("[mock] Sign-in requested", { from, scenario, loginScenario });
    alert("Sign-in is not available in preview mode.");
  }, [from, scenario, loginScenario]);
}
