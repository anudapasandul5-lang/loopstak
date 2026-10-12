import Link from "next/link";
import type { Metadata } from "next";
import { AnalyticsChoice } from "@/components/AnalyticsChoice";
import { BUILDER, SITE_NAME } from "@/lib/site";
import { PRIVACY_POINTS } from "@/content/copy";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: `How we handle your details | ${SITE_NAME}`,
  description: "What the contact form collects, where it goes, and how to have it deleted.",
};

export default function Privacy() {
  return (
    <section className={styles.doc}>
      <div className={styles.panel}>
        <h1 className={styles.title}>How we handle your details</h1>
        <p className={styles.lede}>
          {SITE_NAME} is built and run by {BUILDER}. This page says what the site collects and what we do
          with it, in plain words. If anything here is unclear, ask us.
        </p>

        <h2 className={styles.h2}>The short version</h2>
        <ul className={styles.list}>
          {PRIVACY_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <h2 className={styles.h2}>Analytics and your choice</h2>
        <p className={styles.p}>
          The first time you visit, a banner asks whether we may count visits with PostHog. Until you click
          ALLOW, PostHog is not loaded and the site makes no analytics request. If you click NO THANKS,
          it stays off. PostHog runs on an EU host and session replays are turned off.
        </p>
        <p className={styles.p}>
          PostHog keeps an anonymous visitor id in your browser, in local storage and in a cookie. To change
          your answer, use the button below. The banner comes back after the page reloads.
        </p>
        <AnalyticsChoice />

        <h2 className={styles.h2}>Your rights and deletion</h2>
        <p className={styles.p}>
          You can ask to see, correct or delete what you sent us at any time. Contact us through the site,
          by the form or on WhatsApp, and we will do it. If you message us on WhatsApp, WhatsApp&rsquo;s own
          privacy terms apply to that chat.
        </p>

        <p className={styles.back}>
          <Link href="/">Back to the homepage</Link>
        </p>
      </div>
    </section>
  );
}
