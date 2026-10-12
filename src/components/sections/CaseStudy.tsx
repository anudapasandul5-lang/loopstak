"use client";

import { useEffect, useRef } from "react";
import { HOME } from "@/content/copy";
import { ideaCallHref } from "@/lib/site";
import { Flost8DashboardMock } from "./Flost8DashboardMock";
import styles from "./CaseStudy.module.css";

// Short UI labels for the four fields (not in copy.ts).
const FIELD_LABELS = ["The problem →", "What we built →", "How it helps →", "What else we can build →"];

export function CaseStudy() {
  const root = useRef<HTMLElement>(null);
  const c = HOME.caseStudy;
  const book = ideaCallHref();
  const external = /^https?:/.test(book);
  const fields = [c.problem, c.built, c.helps, c.more];

  // Light reveal: fade/translate once as the block enters. Skipped entirely under reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.reveal = "ready";
    const items = el.querySelectorAll<HTMLElement>("[data-r]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} id="flost8" className={styles.section} aria-labelledby="flost8-label">
      <div className={styles.inner}>
        <h2 id="flost8-label" className={styles.label}>
          {c.label}
        </h2>
        <p className={styles.title} translate="no" data-r>
          {c.title}
        </p>
        <div className={styles.grid}>
          <div className={styles.text}>
            {fields.map((f, i) => (
              <div key={FIELD_LABELS[i]} className={styles.field} data-r>
                <h3 className={styles.fieldLabel}>{FIELD_LABELS[i]}</h3>
                <p className={i === 0 ? styles.lead : styles.body}>{f}</p>
              </div>
            ))}
            <a
              className={`pill ${styles.cta}`}
              href={book}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              data-r
            >
              {c.cta}
              {external && <span className="sr-only"> (opens in a new tab)</span>}
            </a>
          </div>
          <div className={styles.visual} data-r>
            <Flost8DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}
