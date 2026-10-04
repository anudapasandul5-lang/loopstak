"use client";

import { useEffect } from "react";

/**
 * Page choreography with anime.js. Headings split into words and rise in with a blur-to-sharp
 * (the blur hides the seam between states); copy blocks and list rows stagger in once as they
 * enter. Everything is visible by default: the html.anim class that hides it is only added by
 * the head script when motion is allowed, and removed here (or by a timeout) either way.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove("anim");
      return;
    }

    let alive = true;
    let cleanup = () => {};

    (async () => {
      const { animate, createScope, splitText, stagger, utils } = await import("animejs");
      if (!alive) return;
      // the head-script timeout already revealed everything: don't hide it again
      if (!root.classList.contains("anim")) return;

      const players: Array<{ el: Element; play: () => void }> = [];
      const scope = createScope({ root: document.body }).add(() => {
        // headings: split into words, rise + unblur
        document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          const split = splitText(el, { words: true });
          utils.set(split.words, { opacity: 0, y: "55%", filter: "blur(10px)" });
          el.style.visibility = "visible";
          const a = animate(split.words, {
            opacity: 1,
            y: "0%",
            filter: "blur(0px)",
            duration: 900,
            ease: "out(4)",
            delay: stagger(65),
            autoplay: false,
          });
          players.push({ el, play: () => a.play() });
        });

        // blocks and rows: stagger in
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          const mode = el.dataset.reveal;
          const targets: Element[] =
            mode === "children" ? Array.from(el.children) : mode === "li" ? Array.from(el.querySelectorAll("li")) : [el];
          utils.set(targets, { opacity: 0, y: 22 });
          el.style.visibility = "visible";
          const a = animate(targets, {
            opacity: 1,
            y: 0,
            duration: 760,
            ease: "out(4)",
            delay: stagger(70),
            autoplay: false,
          });
          players.push({ el, play: () => a.play() });
        });
      });

      // play each once, the first time it is mostly in view; the hero goes right away
      const seen = new WeakSet<Element>();
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting || seen.has(e.target)) continue;
            seen.add(e.target);
            players.find((p) => p.el === e.target)?.play();
          }
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
      );
      players.forEach((p) => io.observe(p.el));

      root.classList.remove("anim");

      cleanup = () => {
        io.disconnect();
        scope.revert();
      };
    })();

    return () => {
      alive = false;
      cleanup();
    };
  }, []);

  return null;
}
