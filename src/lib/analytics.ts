/**
 * PostHog consent helpers. posthog-js is imported only inside startAnalytics(),
 * so no PostHog code is in the page's initial bundle path.
 */

export const CONSENT_KEY = "loopstak-consent";
export type Choice = "granted" | "denied";

/** Stored choice, or null when none is stored or storage is unavailable. */
export function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeChoice(choice: Choice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
}

export function clearChoice(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Nothing stored to clear.
  }
}

let started: Promise<void> | null = null;

/** Loads and starts PostHog once. Does nothing when no key is configured. */
export function startAnalytics(): Promise<void> {
  // NEXT_PUBLIC_* values are inlined at build time, so reference them literally.
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return Promise.resolve();
  started ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      // || (not ??) so an empty NEXT_PUBLIC_POSTHOG_HOST= line in .env falls back to the EU host.
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      disable_session_recording: true,
      persistence: "localStorage+cookie",
      capture_pageview: true,
      autocapture: false,
    });
  });
  return started;
}
