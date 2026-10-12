"use client";

import Link from "next/link";
import { useRef } from "react";
import { ClayStage } from "@/components/clay/ClayStage";
import { HeroLoop } from "@/components/clay/scenes/HeroLoop";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { ideaCallHref } from "@/lib/site";

/** Hero. The text is plain HTML and paints first; the clay loop mounts after first paint. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, "hero");
  const book = ideaCallHref();
  const external = /^https?:/.test(book);

  return (
    <section id="top" ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title" className="hero-title">
          The website and the AI behind it. Built for you. <span className="own">Owned by you.</span>
        </h1>
        <p className="hero-sub">
          Websites, AI agents, Claude setups and AI teaching for owner-run businesses.
        </p>
        <div className="hero-actions">
          <a
            className="btn-primary"
            href={book}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            Book a free idea call →
          </a>
          <Link className="link-label" href="/#prices">
            See prices →
          </Link>
        </div>
      </div>
      <ClayStage
        className="hero-stage"
        scene={({ reduced }) => <HeroLoop reduced={reduced} />}
        still="/stills/loop.webp"
        label="A soft clay infinity loop with mint beads, slowly turning."
      />
    </section>
  );
}
