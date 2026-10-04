"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SITE_NAME, primaryCta } from "@/lib/site";

const LINKS = [
  ["process", "How it works"],
  ["prices", "Prices"],
  ["keys", "What you own"],
  ["work", "Work"],
] as const;

export function Header() {
  const cta = primaryCta();
  const [active, setActive] = useState("");

  // highlight the nav item for whichever section holds the middle of the screen
  useEffect(() => {
    const els = LINKS.map(([id]) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const id = e.target.id;
          // clear the highlight when its section leaves (e.g. into the hero or contact, which have no nav item)
          setActive((cur) => (e.isIntersecting ? id : cur === id ? "" : cur));
        }),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/#top" className="mark" aria-label={`${SITE_NAME}, back to top`}>
          <Image src="/brand/loopstak-white.png" alt="" width={880} height={210} priority />
        </Link>
        <nav aria-label="Primary" className="navbar">
          {LINKS.map(([id, label]) => (
            <Link key={id} href={`/#${id}`} aria-current={active === id ? "true" : undefined}>
              {label}
            </Link>
          ))}
          <a className="pill" href={cta.href}>
            {cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
