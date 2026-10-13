"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { SERVICES, type ServiceId } from "@/lib/services";

/**
 * One tab per Service (WAI-ARIA tabs: arrow keys, Home and End move between tabs).
 * Panels are rendered on the server and passed in, so every price is in the HTML.
 * The sliding marker follows SmoothUI's Animated Tabs (MIT), rebuilt with a CSS transition.
 */
export function PriceTabs({ panels }: { panels: Record<ServiceId, ReactNode> }) {
  const [active, setActive] = useState<ServiceId>("website");
  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  // move the marker under the active tab; re-measure when the layout changes (2x2 on phones)
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const place = () => {
      const tab = tabs.current[SERVICES.findIndex((s) => s.id === active)];
      if (!tab) return;
      el.style.setProperty("--tx", `${tab.offsetLeft}px`);
      el.style.setProperty("--ty", `${tab.offsetTop + tab.offsetHeight}px`);
      el.style.setProperty("--tw", `${tab.offsetWidth}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = SERVICES.length - 1;
    const to = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setActive(SERVICES[to].id);
    tabs.current[to]?.focus();
  };

  return (
    <div className="tabs">
      <div ref={list} className="tablist" role="tablist" aria-label="Services">
        {SERVICES.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`tab-${s.id}`}
            type="button"
            role="tab"
            aria-selected={active === s.id}
            aria-controls={`panel-${s.id}`}
            tabIndex={active === s.id ? 0 : -1}
            onClick={() => setActive(s.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className="tab-n">{s.n}</span>
            {s.name}
          </button>
        ))}
        <span className="tab-marker" aria-hidden="true" />
      </div>
      {SERVICES.map((s) => (
        <div
          key={s.id}
          id={`panel-${s.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${s.id}`}
          hidden={active !== s.id}
          tabIndex={0}
          className="tabpanel"
        >
          {panels[s.id]}
          <Link className="arrow-link" href={`/${s.slug}`}>
            {s.name} page <span aria-hidden="true">→</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
