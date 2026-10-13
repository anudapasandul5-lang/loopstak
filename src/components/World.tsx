"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type WorldApi = { setSections(els: HTMLElement[]): void; dispose(): void };

const sectionsOnPage = () => Array.from(document.querySelectorAll<HTMLElement>("main [data-form]"));

/**
 * The fixed 3D canvas behind the page. Decorative only: aria-hidden, no pointer events.
 * three.js loads after the page is idle, so text and buttons never wait for it. Without WebGL2
 * the canvas stays hidden and the plain background shows.
 */
export function World() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<WorldApi | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    if (!document.createElement("canvas").getContext("webgl2")) return;

    let cancelled = false;
    const phone = matchMedia("(max-width: 760px)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const low = phone && ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = () =>
      import("./world/engine")
        .then(({ startWorld }) => {
          if (cancelled) return;
          const w = startWorld(el, { phone, low, reduced });
          world.current = w;
          w.setSections(sectionsOnPage());
          el.addEventListener("webglcontextlost", () => {
            document.documentElement.classList.remove("world-on");
            w.dispose();
            world.current = null;
          });
          requestAnimationFrame(() => document.documentElement.classList.add("world-on"));
        })
        .catch(() => {
          /* no 3D; the static background stays */
        });

    // wait for load and an idle moment, so the 3D never competes with the first paint
    let idle = 0;
    const schedule = () => {
      idle = typeof requestIdleCallback === "function" ? requestIdleCallback(start, { timeout: 2000 }) : window.setTimeout(start, 600);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      else clearTimeout(idle);
      world.current?.dispose();
      world.current = null;
      document.documentElement.classList.remove("world-on");
    };
  }, []);

  // a new page: the blocks rebuild into its first shape
  useEffect(() => {
    world.current?.setSections(sectionsOnPage());
  }, [pathname]);

  return <canvas ref={canvas} className="world" aria-hidden="true" />;
}
