"use client";

import { useEffect, useRef } from "react";

/**
 * One global cursor label (mounted once in the layout). While the pointer is over an element, or
 * a child of one, that carries `data-cursor="DRAG"` / `"VIEW"`, a small label follows the pointer.
 * Fine pointers with hover only; off with reduced motion. Decorative (aria-hidden): never the
 * only cue, every `data-cursor` element must work without it.
 */
export function CursorLabel() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    let text = "";
    const place = () => {
      raf = 0;
      node.style.transform = `translate3d(${x + 16}px, ${y + 16}px, 0)`;
    };
    const show = (t: string) => {
      if (t === text) return;
      text = t;
      node.textContent = t;
      node.dataset.show = t ? "true" : "false";
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return show("");
      x = e.clientX;
      y = e.clientY;
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cursor]") : null;
      show(target?.dataset.cursor ?? "");
      if (!raf) raf = requestAnimationFrame(place);
    };
    const onLeave = () => show("");
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={el} className="cursor-label" data-show="false" aria-hidden="true">
      {/* filled by the pointer handler */}
    </div>
  );
}
