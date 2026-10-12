import Image from "next/image";
import { HOME } from "@/content/copy";
import styles from "./WhoBuilds.module.css";

/**
 * Anuda's photo has not been supplied yet. To use the real one: put it at public/brand/anuda.jpg
 * and change the next line to `const PHOTO: string | null = "/brand/anuda.jpg";`. That is the only change.
 */
const PHOTO: string | null = null;

export function WhoBuilds() {
  const w = HOME.whoBuilds;
  return (
    <section id="who" className={styles.section} aria-labelledby="who-label">
      <div className={styles.inner}>
        <figure className={styles.figure}>
          <div className={styles.frame}>
            <div className={styles.bevel}>
              {PHOTO ? (
                <Image
                  className={styles.photo}
                  src={PHOTO}
                  alt=""
                  width={800}
                  height={1000}
                  sizes="(min-width: 900px) 26rem, 70vw"
                />
              ) : (
                // Decorative placeholder: initials only, hidden from assistive tech.
                <span className={styles.initials} aria-hidden="true">
                  AP
                </span>
              )}
            </div>
          </div>
          <figcaption className={styles.caption}>{w.photoCaption}</figcaption>
        </figure>
        <div className={styles.copy}>
          <h2 id="who-label" className={styles.label}>
            {w.label}
          </h2>
          <p className={styles.headline}>{w.headline}</p>
          <p className={styles.body}>{w.body}</p>
        </div>
      </div>
    </section>
  );
}
