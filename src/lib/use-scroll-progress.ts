"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { setProgress } from "@/lib/scroll-store";

let registered = false;
function register() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

/**
 * One ScrollTrigger per section, on normal page scroll (no pinning, no scroll-jacking).
 * It only writes 0..1 into the scroll store under `id`; scenes read it each frame.
 * Defaults: progress 0 when the section top meets the viewport top, 1 when its bottom leaves.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  id: string,
  vars: ScrollTrigger.Vars = {},
) {
  const varsRef = useRef(vars);
  useGSAP(
    () => {
      register();
      const el = ref.current;
      if (!el) return;
      setProgress(id, 0);
      ScrollTrigger.create({
        start: "top top",
        end: "bottom top",
        ...varsRef.current,
        trigger: el,
        onUpdate: (self) => setProgress(id, self.progress),
        onRefresh: (self) => setProgress(id, self.progress),
      });
    },
    { scope: ref, dependencies: [id] },
  );
}
