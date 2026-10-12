"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { readChoice, startAnalytics, writeChoice, type Choice } from "@/lib/analytics";
import styles from "./Consent.module.css";

const noopSubscribe = () => () => {};

/** Analytics consent banner. Shown only when PostHog is configured and no choice is stored. */
export function Consent() {
  const [dismissed, setDismissed] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Server and first client render both show nothing; the banner appears after hydration.
  const needsChoice = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) && readChoice() === null,
    () => false,
  );

  useEffect(() => {
    // A stored "granted" choice loads PostHog on every page view.
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && readChoice() === "granted") {
      startAnalytics().catch(() => {});
    }
  }, []);

  function decide(choice: Choice) {
    const hadFocus = ref.current?.contains(document.activeElement) ?? false;
    writeChoice(choice);
    setDismissed(true);
    if (choice === "granted") startAnalytics().catch(() => {});
    // The banner is removed, so move focus to the page instead of losing it.
    if (hadFocus) document.getElementById("content")?.focus({ preventScroll: true });
  }

  if (!needsChoice || dismissed) return null;

  return (
    <section ref={ref} role="region" aria-label="Analytics consent" className={styles.banner}>
      <p className={styles.text}>
        We&rsquo;d like to count visits with PostHog, a privacy-friendly analytics tool hosted in the EU.
        Nothing loads unless you allow it. <Link href="/privacy">How we handle your details</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.allow} onClick={() => decide("granted")}>
          ALLOW
        </button>
        <button type="button" className={styles.deny} onClick={() => decide("denied")}>
          NO THANKS
        </button>
      </div>
    </section>
  );
}
