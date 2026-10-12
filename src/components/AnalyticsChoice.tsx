"use client";

import { clearChoice } from "@/lib/analytics";
import styles from "./AnalyticsChoice.module.css";

/** Clears the stored analytics choice so the banner comes back after a reload. */
export function AnalyticsChoice() {
  // Without a PostHog key there is no analytics and no choice to change.
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => {
        clearChoice();
        window.location.reload();
      }}
    >
      Change analytics choice
    </button>
  );
}
