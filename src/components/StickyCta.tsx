"use client";

import { useEffect, useState } from "react";
import { primaryCta } from "@/lib/site";

/** Phone-only action bar. Hidden until the hero has scrolled away, in every browser. */
export function StickyCta() {
  const cta = primaryCta(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => setShow(scrollY > 420);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <div className={`sticky-cta${show ? " show" : ""}`} aria-hidden={!show}>
      <a className="pill" href={cta.href} tabIndex={show ? 0 : -1}>
        {cta.label}
      </a>
    </div>
  );
}
