"use client";

import { useRef } from "react";
import { ClayStage } from "@/components/clay/ClayStage";
import { KeysDoor } from "@/components/clay/scenes/KeysDoor";
import { HOME } from "@/content/copy";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import styles from "./Keys.module.css";

/**
 * The Keys. Scrubbed, not pinned: the section is tall and the stage sticks inside it, so plain
 * page scroll turns the key and then opens the door (both ways). Reduced motion: door open.
 */
export function Keys() {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, "keys", { start: "top 40%", end: "bottom bottom" });
  const k = HOME.keys;

  return (
    <section ref={ref} id="keys" className={styles.keys} aria-labelledby="keys-headline">
      <div className={styles.inner}>
        <div className={styles.stage}>
          <ClayStage
            scene={({ reduced }) => <KeysDoor reduced={reduced} />}
            still="/stills/key-door.png"
            label="A soft clay door in a stone frame. A mint key turns in the lock and the door swings open."
          />
        </div>
        <div className={styles.copy}>
          <p className={styles.label}>{k.label}</p>
          <h2 id="keys-headline" className={styles.headline}>
            {k.headline}
          </h2>
          <p className={styles.body}>{k.body}</p>
        </div>
      </div>
    </section>
  );
}
