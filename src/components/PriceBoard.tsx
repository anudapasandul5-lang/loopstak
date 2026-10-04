"use client";

import { useRef, useState } from "react";
import { LKR_PER_USD, OFFERS, toUsd } from "@/lib/site";

type Cur = "LKR" | "USD";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const value = (lkr: number, cur: Cur) => (cur === "LKR" ? lkr : toUsd(lkr));

export function PriceBoard() {
  const [cur, setCur] = useState<Cur>("LKR"); // the toggle
  const [label, setLabel] = useState<Cur>("LKR"); // the currency the digits actually show
  const [rolling, setRolling] = useState(false);
  const figs = useRef<Array<HTMLSpanElement | null>>([]);
  const shown = useRef<number[]>(OFFERS.map((o) => o.lkr));
  const tweens = useRef<Array<{ pause: () => unknown }>>([]);

  async function pick(next: Cur) {
    if (next === cur) return;
    setCur(next);
    tweens.current.forEach((t) => t.pause()); // a fast second tap must not leave two tweens fighting
    tweens.current = [];

    const instant = () => {
      OFFERS.forEach((o, i) => {
        const el = figs.current[i];
        if (el) el.textContent = fmt(value(o.lkr, next));
        shown.current[i] = value(o.lkr, next);
      });
      setLabel(next);
      setRolling(false);
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return instant();

    // numbers roll to the new currency (anime.js animating plain objects). The currency
    // symbol stays hidden mid-roll so a half-way number is never shown as a price.
    setRolling(true);
    const { animate } = await import("animejs");
    let done = 0;
    OFFERS.forEach((o, i) => {
      const el = figs.current[i];
      if (!el) return;
      const state = { v: shown.current[i] };
      const tw = animate(state, {
        v: value(o.lkr, next),
        duration: 520,
        ease: "out(4)",
        onUpdate: () => {
          el.textContent = fmt(state.v);
          shown.current[i] = state.v;
        },
        onComplete: () => {
          shown.current[i] = value(o.lkr, next);
          el.textContent = fmt(shown.current[i]);
          if (++done === OFFERS.length) {
            setLabel(next);
            setRolling(false);
          }
        },
      });
      tweens.current.push(tw);
    });
  }

  return (
    <div>
      <div className="switch" role="group" aria-label="Currency">
        {(["LKR", "USD"] as const).map((c) => (
          <button key={c} type="button" aria-pressed={cur === c} onClick={() => pick(c)}>
            {c}
          </button>
        ))}
      </div>

      <ul className="rows" style={{ marginTop: "0.75rem" }} data-reveal="li">
        {OFFERS.map((o, i) => (
          <li key={o.id} className="price">
            <h3>{o.name}</h3>
            <p>{o.blurb}</p>
            <div className="fig">
              <span className="sr-only">
                {label === "LKR" ? `${fmt(o.lkr)} rupees` : `about ${fmt(toUsd(o.lkr))} dollars`}, {o.cadence}
              </span>
              <span aria-hidden="true">
                <span className="cur" style={{ visibility: rolling ? "hidden" : "visible" }}>
                  {label === "LKR" ? "LKR" : "≈ $"}
                </span>
                <span
                  ref={(el) => {
                    figs.current[i] = el;
                  }}
                >
                  {fmt(o.lkr)}
                </span>
                <small>{o.cadence}</small>
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="fine">
        Prices are set in LKR. USD is approximate, at {LKR_PER_USD} LKR to the dollar. Domain and
        hosting are bought in your name, so those provider fees are separate.
      </p>
    </div>
  );
}
