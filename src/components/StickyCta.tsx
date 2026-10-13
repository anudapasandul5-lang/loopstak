"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IDEA_CALL_LABEL, ideaCallHref } from "@/lib/site";
import { CtaInner } from "@/components/Cta";

/** Phone-only action bar. Shows once the hero is gone, hides again at the contact section. */
export function StickyCta() {
  const call = ideaCallHref();
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const hero = document.getElementById("top");
    const contact = document.getElementById("contact");
    if (!hero) return;
    const seen = { hero: true, contact: false };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) seen.hero = e.isIntersecting;
        if (e.target === contact) seen.contact = e.isIntersecting;
      });
      setShow(!seen.hero && !seen.contact);
    });
    io.observe(hero);
    if (contact) io.observe(contact);
    return () => io.disconnect();
  }, [pathname]);

  return (
    <aside className={`sticky-cta${show ? " show" : ""}`} aria-label="Quick contact" aria-hidden={!show}>
      <a className="btn btn-primary btn-md" href={call} tabIndex={show ? 0 : -1} {...(call.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
        <CtaInner>{IDEA_CALL_LABEL}</CtaInner>
      </a>
    </aside>
  );
}
