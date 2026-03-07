/**
 * Mock: Authentication hooks.
 * Always returns "not authenticated" state for preview.
 */

export function useIsAuthenticated(): boolean {
  return false;
}

export function useSignIn(_options: {
  from: string;
  scenario: string;
  loginScenario: string;
}): () => void {
  return () => {
    console.log("[mock] Sign-in requested");
    alert("Sign-in is not available in preview mode.");
  };
}
