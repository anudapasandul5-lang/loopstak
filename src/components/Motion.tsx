"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

type Gsap = typeof import("gsap").gsap;
type Mods = { gsap: Gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger; SplitText: typeof import("gsap/SplitText").SplitText };

let mods: Mods | null = null;
const load = async (): Promise<Mods> => {
  if (mods) return mods;
  const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  mods = { gsap, ScrollTrigger, SplitText };
  return mods;
};

/*
  All HTML motion, in one place. Every move has a job:
  - [data-split] headings rise line by line from a mask and open from narrow to full width: they mark
    where a new idea starts.
  - [data-reveal] blocks fade up once, in reading order.
  - [data-scrub] statement: words light up as you read down, so the sentence is read, not skimmed.
  - [data-pan] work: vertical scroll pans the live sites sideways on desktop (phones get a plain list).
  - [data-magnetic] primary buttons lean toward the pointer: feedback that they are live.
  Reduced motion: none of this runs, and nothing is ever left hidden.
*/
function setup({ gsap, ScrollTrigger, SplitText }: Mods, animate: boolean) {
  const root = document.documentElement;
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const offs: Array<() => void> = [];
      const listen = (el: HTMLElement, type: "pointermove" | "pointerleave", fn: (e: PointerEvent) => void) => {
        el.addEventListener(type, fn);
        offs.push(() => el.removeEventListener(type, fn));
      };
      if (animate) {
        gsap.utils.toArray<HTMLElement>("main [data-split]").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              // the width axis opens as the line rises: the heading settles into place
              gsap.fromTo(
                self.lines,
                { yPercent: 108, "--wd": 75 },
                {
                  yPercent: 0,
                  "--wd": 100,
                  duration: 1.15,
                  ease: "expo.out",
                  stagger: 0.09,
                  scrollTrigger: { trigger: el, start: "top 88%", once: true },
                },
              ),
          });
        });

        gsap.set("[data-reveal]", { autoAlpha: 0, y: 32 });
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true }),
        });
      }

      gsap.utils.toArray<HTMLElement>("main [data-scrub]").forEach((el) => {
        const split = SplitText.create(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: true } },
        );
      });

      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (fine) {
        // glow cards: tell the CSS where the pointer is inside each card
        gsap.utils.toArray<HTMLElement>("[data-glow]").forEach((el) => {
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--gx", `${e.clientX - r.left}px`);
            el.style.setProperty("--gy", `${e.clientY - r.top}px`);
          };
          listen(el, "pointermove", move);
        });
        gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
          const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
          const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - r.left - r.width / 2) * 0.22);
            y((e.clientY - r.top - r.height / 2) * 0.3);
          };
          const leave = () => (x(0), y(0));
          listen(el, "pointermove", move);
          listen(el, "pointerleave", leave);
        });
      }
      return () => offs.forEach((off) => off());
    });

    // horizontal pan of the work: pin the section, slide the track (canonical: start top top, scrub)
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("main [data-pan]").forEach((wrap) => {
        const track = wrap.querySelector<HTMLElement>("[data-pan-track]");
        if (!track) return;
        const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
        const pan = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
        });
        // each screenshot drifts inside its frame as it crosses the screen
        track.querySelectorAll<HTMLElement>("[data-drift]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            { xPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: pan, start: "left right", end: "right left", scrub: true } },
          );
        });
      });
    });
  });

  root.classList.remove("anim");
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
  return () => {
    window.removeEventListener("load", refresh);
    ctx.revert();
  };
}

export function Motion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    let undo: (() => void) | undefined;
    let dead = false;
    if (mods) {
      // later pages: modules are cached, so set up before paint and animate in
      undo = setup(mods, true);
    } else {
      load()
        .then((m) => {
          // if the safety timeout already showed the text, do not hide it again
          if (!dead) undo = setup(m, root.classList.contains("anim"));
        })
        .catch(() => root.classList.remove("anim"));
    }
    return () => {
      dead = true;
      undo?.();
    };
  }, [pathname]);

  return null;
}
