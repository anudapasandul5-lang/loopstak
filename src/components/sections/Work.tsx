"use client";

import { useRef, type FocusEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HOME } from "@/content/copy";
import { WORK } from "@/lib/site";
import { ClipTile } from "./ClipTile";
import styles from "./Work.module.css";

/**
 * Clip files. Anuda's clips are a one-line add: put the file in public/clips and set `src`
 * (and optionally `poster`) on the matching id, e.g. { id: "reel-reader", src: "/clips/reel-reader.mp4" }.
 * The friend's link comes from NEXT_PUBLIC_FRIEND_BUILD_URL; with no value there is no link.
 */
const CLIPS: Record<string, { src?: string; poster?: string; href?: string }> = {
  "whatsapp-notes-bridge": {},
  "reel-reader": {},
  "friend-agent": { href: process.env.NEXT_PUBLIC_FRIEND_BUILD_URL || undefined },
};

const SHOT = Object.fromEntries(WORK.map((w) => [w.href, w.src]));
const domain = (href: string) => href.replace(/^https?:\/\//, "");

export function Work() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const w = HOME.work;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      // Desktop only, motion allowed: pin the row and slide it sideways while the page scrolls.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        if (!el || !pin.current) return;
        const dist = () => Math.max(0, el.scrollWidth - (el.parentElement?.clientWidth ?? 0));
        const tween = gsap.to(el, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        trigger.current = tween.scrollTrigger ?? null;
        return () => {
          trigger.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Keyboard: a card that is off screen is brought in by moving the page to the matching scroll position.
  function onFocus(e: FocusEvent<HTMLUListElement>) {
    const st = trigger.current;
    const el = track.current;
    const card = (e.target as HTMLElement).closest("li") as HTMLElement | null;
    if (!st || !el || !card) return;
    const r = card.getBoundingClientRect();
    if (r.left >= 0 && r.right <= window.innerWidth) return;
    const max = Math.max(0, el.scrollWidth - (el.parentElement?.clientWidth ?? 0));
    if (!max) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const target = Math.min(max, Math.max(0, card.offsetLeft - pad));
    window.scrollTo({ top: st.start + (target / max) * (st.end - st.start), behavior: "instant" });
  }

  return (
    <section ref={root} id="work" className={styles.work} aria-labelledby="work-label">
      <div ref={pin} className={styles.pin}>
        <header className={styles.head}>
          <h2 id="work-label" className={styles.label}>
            {w.label}
          </h2>
          <p className={styles.intro}>{w.intro}</p>
        </header>
        <div className={styles.viewport}>
          <ul ref={track} className={styles.track} onFocus={onFocus}>
            {w.sites.map((s) => (
              <li key={s.name} className={styles.item}>
                <a
                  className={styles.card}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="VIEW"
                >
                  <span className={styles.frame}>
                    <span className={styles.bevel}>
                      <Image
                        className={styles.shot}
                        src={SHOT[s.href]}
                        alt=""
                        width={1440}
                        height={900}
                        sizes="(min-width: 1024px) 40vw, 90vw"
                        draggable={false}
                      />
                    </span>
                  </span>
                  <span className={styles.name} translate="no">
                    {s.name}
                  </span>
                  <span className={styles.note}>{s.note}</span>
                  {s.ownVenture && <span className={styles.own}>{w.ownVentureNote}</span>}
                  <span className={styles.go}>
                    View {domain(s.href)} →<span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.clips}>
        <h3 className={styles.label}>{HOME.clips.label}</h3>
        <p className={styles.intro}>{HOME.clips.intro}</p>
        <div className={styles.clipGrid}>
          {HOME.clips.items.map((c) => (
            <ClipTile
              key={c.id}
              name={c.name}
              tag={c.tag}
              caption={c.caption}
              linkLabel="View the build"
              {...CLIPS[c.id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
