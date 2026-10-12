"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ClayStage } from "@/components/clay/ClayStage";
import { ServiceRest, ServicesTurntable, SERVICE_COUNT, activeIndex } from "@/components/clay/scenes/ServicesTurntable";
import { HOME, SERVICES } from "@/content/copy";
import { setProgress } from "@/lib/scroll-store";
import styles from "./Services.module.css";

/** Pin + turntable only on wide screens with motion allowed. Must match the CSS in Services.module.css. */
const PINNED = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";

const STILLS = ["/stills/svc-site.png", "/stills/svc-gears.png", "/stills/svc-plug.png", "/stills/svc-table.png"];
const ALTS = [
  "A clay page layout with a mint slab on top.",
  "A ring of six soft clay gears with one mint bead.",
  "A clay plug between two soft blocks.",
  "A clay round table with four faceless figures.",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function Services() {
  const ref = useRef<HTMLElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(PINNED, () => {
        setProgress("services", 0);
        const sync = (p: number) => {
          setProgress("services", p);
          const i = activeIndex(p);
          if (i !== activeRef.current) {
            activeRef.current = i;
            setActive(i);
          }
        };
        trigger.current = ScrollTrigger.create({
          trigger: ref.current,
          start: "top top",
          end: () => `+=${window.innerHeight * SERVICE_COUNT * 0.75}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => sync(self.progress),
          onRefresh: (self) => sync(self.progress),
        });
        const el = carousel.current;
        el?.setAttribute("data-cursor", "DRAG");
        return () => {
          trigger.current = null;
          el?.removeAttribute("data-cursor");
          setProgress("services", 0);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  /** Scroll so that item `i` is the active one (pinned), or just focus it (list). */
  const show = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    const y = st.start + ((i + 0.5) / SERVICE_COUNT) * (st.end - st.start);
    window.scrollTo({ top: y });
  };

  const linkAt = (i: number) => ref.current?.querySelectorAll<HTMLAnchorElement>("[data-svc-link]")[i];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const links = Array.from(ref.current?.querySelectorAll<HTMLAnchorElement>("[data-svc-link]") ?? []);
    const here = links.findIndex((l) => l === document.activeElement);
    const from = here >= 0 ? here : activeRef.current;
    const to = Math.min(SERVICE_COUNT - 1, Math.max(0, from + (e.key === "ArrowRight" ? 1 : -1)));
    e.preventDefault();
    linkAt(to)?.focus({ preventScroll: !!trigger.current }); // onFocus below does the scrolling
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!trigger.current || e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, y: window.scrollY, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const st = trigger.current;
    if (!d || !st) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
    d.moved = true;
    // dragging left moves forward: the full pinned range is about 60% of the width
    const k = (st.end - st.start) / (window.innerWidth * 0.6);
    window.scrollTo({ top: d.y - dx * k, behavior: "instant" });
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.moved && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // keep `moved` until the click that follows has been swallowed
    if (drag.current && !drag.current.moved) drag.current = null;
  };

  return (
    <section ref={ref} id="services" className={styles.services} aria-labelledby="services-label" data-active={active}>
      <h2 id="services-label" className={styles.label}>
        {HOME.servicesLabel}
      </h2>
      <div
        ref={carousel}
        className={styles.carousel}
        role="group"
        aria-roledescription="carousel"
        aria-label="Our four Services"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
          drag.current = null;
        }}
      >
        <ol className={styles.items}>
          {SERVICES.map((s, i) => (
            <li key={s.slug} className={styles.item} data-active={i === active} aria-label={`${i + 1} of ${SERVICE_COUNT}`}>
              <div className={styles.itemStage}>
                <ClayStage
                  scene={() => <ServiceRest index={i} />}
                  still={STILLS[i]}
                  label={ALTS[i]}
                />
              </div>
              <span className={styles.number} aria-hidden="true">
                {s.number}
              </span>
              <h3 className={styles.name}>{s.name}</h3>
              <p className={styles.line}>{s.line}</p>
              <Link
                className={styles.link}
                href={`/${s.slug}`}
                data-svc-link
                onFocus={() => {
                  if (activeRef.current !== i) show(i);
                }}
              >
                {s.linkLabel}
              </Link>
            </li>
          ))}
        </ol>
        <div className={styles.stage}>
          <ClayStage
            scene={({ reduced }) => <ServicesTurntable reduced={reduced} />}
            still={STILLS[active]}
            label={ALTS[active]}
          />
        </div>
      </div>
      <div className={styles.indicator} aria-hidden="true">
        <span className={styles.count}>
          {pad(active + 1)} / {pad(SERVICE_COUNT)}
        </span>
        <span className={styles.names}>
          {SERVICES.map((s, i) => (
            <span key={s.slug} data-on={i === active}>
              {s.name}
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}
