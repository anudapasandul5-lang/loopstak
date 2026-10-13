"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICES } from "@/lib/services";

/** The four Services on a slow loop. Pausable (and paused for reduced motion), since it moves for more than 5 s. */
export function Ticker() {
  const [paused, setPaused] = useState(false);
  const row = (hidden: boolean) => (
    <ul className="ticker-row" aria-hidden={hidden || undefined}>
      {SERVICES.map((s) => (
        <li key={s.id}>
          {hidden ? <span>{s.name}</span> : <Link href={`/${s.slug}`}>{s.name}</Link>}
          <span className="ticker-sep" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`ticker${paused ? " paused" : ""}`}>
      <div className="ticker-track">
        {row(false)}
        {row(true)}
        {row(true)}
      </div>
      <button type="button" className="ticker-btn" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? "Play" : "Pause"}
        <span className="sr-only"> the moving list of Services</span>
      </button>
    </div>
  );
}
