"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { WORK } from "@/lib/site";

const STEP_MS = 3200;

/**
 * The window cut into the hero headline: real client sites, one at a time.
 * Plays one full round, then rests on the first site. Never auto-plays with reduced motion,
 * and always has a visible pause/play control (moving content needs one).
 * Only the first image loads with the page; the rest wait until the page has finished loading.
 * On wide screens it lays itself over the empty slot (.hl-gap) inside the headline; until that
 * is measured (or without JS, or on phones) it sits as a normal block, so nothing is ever hidden.
 */
export function HeroWindow() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rest, setRest] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // place the window over the headline's empty slot, and keep it there as fonts load and the page resizes
  useEffect(() => {
    const fig = ref.current;
    const hero = fig?.closest<HTMLElement>(".hero");
    const gap = hero?.querySelector<HTMLElement>(".hl-gap");
    if (!fig || !hero || !gap) return;
    const place = () => {
      const g = gap.getBoundingClientRect();
      if (!g.width) return hero.classList.remove("hw-placed"); // slot hidden (phones)
      // offsets are relative to the box the window is positioned in, not the whole section
      const h = (fig.offsetParent ?? hero).getBoundingClientRect();
      hero.style.setProperty("--hw-x", `${g.left - h.left}px`);
      hero.style.setProperty("--hw-y", `${g.top - h.top}px`);
      hero.style.setProperty("--hw-w", `${g.width}px`);
      hero.style.setProperty("--hw-h", `${g.height}px`);
      hero.classList.add("hw-placed");
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(hero);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // after the page has loaded: fetch the other sites, and start playing unless motion is reduced
    const ready = () => {
      setRest(true);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
    };
    let t = 0;
    if (document.readyState === "complete") t = window.setTimeout(ready, 0);
    else addEventListener("load", ready, { once: true });
    return () => {
      clearTimeout(t);
      removeEventListener("load", ready);
    };
  }, []);

  useEffect(() => {
    if (!playing || !rest) return;
    const t = setTimeout(() => {
      const next = (i + 1) % WORK.length;
      setI(next);
      if (next === 0) setPlaying(false); // one full round, then stop
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [i, playing, rest]);

  const site = WORK[i];
  return (
    <>
      <figure className="hero-window" ref={ref}>
        <a
          className="hw-frame"
          href={site.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${site.name} website, built by us (opens in a new tab)`}
        >
          {WORK.map((w, k) =>
            k === 0 || rest ? (
              <Image
                key={w.src}
                src={w.src}
                alt=""
                width={1440}
                height={900}
                sizes="(max-width: 52rem) 92vw, 34rem"
                priority={k === 0}
                className={k === i ? "on" : undefined}
              />
            ) : null,
          )}
        </a>
      </figure>
      <p className="hw-cap">
        <span aria-live="polite">
          <strong translate="no">{site.name}</strong>, built by us
        </span>
        <button type="button" className="hw-play" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </button>
      </p>
    </>
  );
}
