"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ClayStage } from "@/components/clay/ClayStage";
import { StatementLoop } from "@/components/clay/scenes/StatementLoop";
import { HOME } from "@/content/copy";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import styles from "./Statement.module.css";

/** The one hand-drawn circle on the site. Slightly lopsided on purpose, with an overshooting tail. */
const CIRCLE =
  "M 268 20 C 212 3 96 -1 38 26 C 4 44 -2 76 40 90 C 98 108 222 106 280 82 C 306 68 300 38 262 22 C 244 15 222 11 200 9";

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const s = HOME.statement;
  useScrollProgress(ref, "statement", { start: "top bottom", end: "bottom top" });

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const el = path.current;
      if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return; // stays fully drawn
      gsap.fromTo(
        el,
        { strokeDashoffset: 1.03 },
        {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power2.inOut",
          scrollTrigger: { trigger: ref.current, start: "top 55%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="why" className={styles.statement} aria-labelledby="statement-label">
      <div className={styles.stage}>
        <ClayStage
          scene={({ reduced }) => <StatementLoop reduced={reduced} />}
          still="/stills/loop.png"
          label="A soft clay infinity loop uncoiling as you scroll."
        />
      </div>
      <div className={styles.copy}>
        <p id="statement-label" className={styles.label}>
          {s.label}
        </p>
        <p className={styles.text}>
          {s.before}
          <span className={styles.circled}>
            {s.circled}
            <svg className={styles.circle} viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path ref={path} d={CIRCLE} pathLength={1} />
            </svg>
          </span>
          {s.after}
        </p>
      </div>
    </section>
  );
}
