"use client";

import { useState } from "react";
import { HOME } from "@/content/copy";
import styles from "./Ticker.module.css";

/** Slow marquee of the four Service names. Transform-only CSS animation; reduced motion shows a static row. */
export function Ticker() {
  const [paused, setPaused] = useState(false);
  const names = HOME.ticker;

  const copy = (hidden: boolean) => (
    <ul className={styles.list} aria-hidden={hidden || undefined}>
      {names.map((n) => (
        <li key={n} className={styles.item}>
          <span>{n}</span>
          <span className={styles.mark} aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <section className={styles.ticker} aria-label="Services" data-paused={paused ? "true" : "false"}>
      <div className={styles.viewport}>
        <div className={styles.track}>
          {copy(false)}
          {copy(true)}
        </div>
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? "Play ticker" : "Pause ticker"}
      </button>
    </section>
  );
}
