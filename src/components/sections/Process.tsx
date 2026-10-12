"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ClayStage } from "@/components/clay/ClayStage";
import { ProcessStack } from "@/components/clay/lazy-scenes";
import { HOME } from "@/content/copy";
import { setProgress } from "@/lib/scroll-store";
import styles from "./Process.module.css";

/**
 * 6 slabs, 4 steps. Slab k lands at progress (k * 0.15 + 0.25), so:
 * steps 1: slabs 1-2 (until 0.40), 2: slab 3 (until 0.55), 3: slabs 4-5 (until 0.80), 4: the mint slab.
 */
const STEP_STARTS = [0, 0.4, 0.55, 0.8];
const stepAt = (p: number) => STEP_STARTS.reduce((a, s, i) => (p >= s ? i : a), 0);

export function Process() {
  const ref = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const p = HOME.process;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const items = Array.from(list.current?.children ?? []) as HTMLElement[];
      const mark = (progress: number) => {
        const on = stepAt(progress);
        items.forEach((li, i) => {
          li.dataset.active = i === on ? "true" : "false";
          if (i === on) li.setAttribute("aria-current", "step");
          else li.removeAttribute("aria-current");
        });
      };
      const clear = () =>
        items.forEach((li) => {
          delete li.dataset.active;
          li.removeAttribute("aria-current");
        });

      const mm = gsap.matchMedia();
      const update = (self: ScrollTrigger) => {
        setProgress("process", self.progress);
        mark(self.progress);
      };
      // Desktop: the section pins and the scroll distance is the build. Scrubbed both ways.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        mark(0);
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          onUpdate: update,
          onRefresh: update,
        });
        return () => {
          setProgress("process", 0);
          clear();
        };
      });
      // Phones: no pinning. The stack stays put at the top of the section (CSS sticky) while plain
      // page scroll through the section drives the same progress.
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        mark(0);
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: update,
          onRefresh: update,
        });
        return () => {
          setProgress("process", 0);
          clear();
        };
      });
      // Reduced motion: nothing is scrubbed; the stack is finished and all steps read equally.
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="process" className={styles.process} aria-labelledby="process-label">
      <div className={styles.inner}>
        <div className={styles.stage}>
          <ClayStage
            scene={({ reduced }) => <ProcessStack reduced={reduced} />}
            still="/stills/stack.webp"
            label="Six soft clay slabs stacking up, the top one in mint."
          />
        </div>
        <div className={styles.copy}>
          <p id="process-label" className={styles.label}>
            {p.label}
          </p>
          <ol ref={list} className={styles.steps}>
            {p.steps.map((s, i) => (
              <li key={s.name} className={styles.step}>
                <span className={styles.n} aria-hidden="true">
                  0{i + 1}
                </span>
                <h3 className={styles.name}>{s.name}</h3>
                <p className={styles.text}>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
