/**
 * Mock: Telemetry.
 * Logs to console instead of sending events.
 */

export function trackPageView(page: string): void {
  console.log(`[telemetry] Page view: ${page}`);
}

export function trackWaitlistJoin(placement: string): void {
  console.log(`[telemetry] Waitlist join clicked: ${placement}`);
}
