"use client";

import { useRef, useState } from "react";
import { INCLUDED, LKR_PER_USD, OFFERS, primaryCta, toUsd } from "@/lib/site";

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
  const cta = primaryCta(true);

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

  const figure = (i: number, lkr: number, cadence: string) => (
    <>
      <span className="sr-only">
        {label === "LKR" ? `${fmt(lkr)} rupees` : `about ${fmt(toUsd(lkr))} dollars`}, {cadence}
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
          {fmt(lkr)}
        </span>
      </span>
    </>
  );

  const [main, ...addons] = OFFERS;

  return (
    <div>
      <div className="switch" role="group" aria-label="Currency">
        {(["LKR", "USD"] as const).map((c) => (
          <button key={c} type="button" aria-pressed={cur === c} onClick={() => pick(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="offer">
        <h3>{main.name}</h3>
        <p className="offer-sub">{main.blurb}</p>
        <div className="fig offer-fig">
          {figure(0, main.lkr, main.cadence)}
          <small>{main.cadence}</small>
        </div>
        <p className="anchor">Freelance WordPress builds in Sri Lanka typically run LKR 60,000–120,000.</p>
        <ul className="check">
          {INCLUDED.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="guarantee">
          <strong>Pay the rest when you’re happy.</strong> 50% to start, 50% after you approve the
          live site.
        </p>
        <a className="pill offer-cta" href={cta.href}>
          {cta.label}
        </a>

        <ul className="addons">
          {addons.map((o, j) => (
            <li key={o.id}>
              <div>
                <h4>{o.name}</h4>
                <p>{o.blurb}</p>
              </div>
              <div className="fig">
                {figure(j + 1, o.lkr, o.cadence)}
                <small>{o.cadence}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="fine">
        Prices are set in LKR. USD is approximate, at {LKR_PER_USD} LKR to the dollar. Your domain and
        hosting cost about LKR 15,000–30,000 a year, paid by you to the providers, in your name. Online
        payments are quoted separately.
      </p>
    </div>
  );
}
