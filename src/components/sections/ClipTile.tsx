"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./Work.module.css";

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

type Props = {
  name: string;
  tag: string;
  caption: string;
  /** mp4 or webm under public/clips. Without it the tile shows a calm placeholder. */
  src?: string;
  poster?: string;
  /** Optional link, e.g. to the friend's live build. */
  href?: string;
  linkLabel?: string;
};

export function ClipTile({ name, tag, caption, src, poster, href, linkLabel }: Props) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  // Lazy: only play while on screen, pause when not. Reduced motion never starts on its own.
  useEffect(() => {
    const v = video.current;
    if (!v || !src) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!reduced && !userPaused.current) v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src, reduced]);

  function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  }

  return (
    <figure className={styles.clip}>
      <div className={styles.clipFrame}>
        {src ? (
          <>
            <video
              ref={video}
              className={styles.video}
              muted
              playsInline
              loop
              preload="none"
              poster={poster}
              aria-label={`${name}, silent clip`}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
            </video>
            <button type="button" className={styles.playBtn} onClick={toggle} aria-pressed={playing}>
              {playing ? "Pause" : "Play"}
              <span className="sr-only"> clip: {name}</span>
            </button>
          </>
        ) : (
          <div className={styles.placeholder}>
            <p>Clip coming soon</p>
          </div>
        )}
      </div>
      <figcaption className={styles.clipCap}>
        <span className={styles.badge}>{tag}</span>
        <h4 className={styles.clipName}>{name}</h4>
        <p className={styles.clipNote}>{caption}</p>
        {href && (
          <a className={styles.clipLink} href={href} target="_blank" rel="noopener noreferrer">
            {linkLabel ?? "Visit"} →<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </figcaption>
    </figure>
  );
}
