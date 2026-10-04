"use client";

import Image from "next/image";
import { useState } from "react";
import { WORK } from "@/lib/site";

/** Hero proof: the live sites as a tilted, clickable stack. Arrows cycle which one is in front. */
export function HeroWork() {
  const [front, setFront] = useState(0);
  const go = (d: number) => setFront((f) => (f + d + WORK.length) % WORK.length);
  const order = [0, 1, 2].map((k) => WORK[(front + k) % WORK.length]);
  const lead = order[0];

  return (
    <div className="hero-work">
      <div className="hw-stage">
        {order
          .map((w, k) => (
            <a
              key={w.href}
              className={`hw-shot hw-${k}`}
              href={w.href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={k === 0 ? 0 : -1}
              aria-hidden={k !== 0}
            >
              <span className="hw-bar">{w.href.replace("https://", "")}</span>
              <Image src={w.src} alt={k === 0 ? `${w.name} website` : ""} width={1440} height={900} priority={k === 0} />
            </a>
          ))
          .reverse()}
      </div>
      <div className="hw-nav">
        <button type="button" onClick={() => go(-1)} aria-label="Previous site">
          ‹
        </button>
        <span className="hw-dots" aria-hidden="true">
          {WORK.map((w, i) => (
            <i key={w.href} className={i === front ? "on" : ""} />
          ))}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="Next site">
          ›
        </button>
        <p aria-live="polite">
          <strong translate="no">{lead.name}</strong>, built by us. Click to visit ↗
        </p>
      </div>
    </div>
  );
}
