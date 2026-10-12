"use client";

import { useEffect, useState } from "react";
import { ideaCallHref, whatsappHref } from "@/lib/site";

/**
 * Phone-only action bar (CSS hides it from 48rem up). Shows once the visitor has scrolled past
 * ~60% of the first screen; hidden while the contact section is in view (its own actions are
 * right there) and, via CSS, while the full-screen menu is open.
 */
export function StickyCta() {
  const book = ideaCallHref();
  const wa = whatsappHref();
  const external = /^https?:/.test(book);
  const [scrolled, setScrolled] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const show = scrolled && !atContact;

  useEffect(() => {
    const on = () => setScrolled(scrollY > innerHeight * 0.6);
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
    };
  }, []);

  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tab = show ? 0 : -1;
  return (
    <aside className={`sticky-cta${show ? " show" : ""}`} aria-hidden={!show} aria-label="Quick contact">
      {wa ? (
        <>
          <a
            className="btn-primary"
            href={book}
            tabIndex={tab}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            Idea call →
          </a>
          <a className="btn-primary sticky-alt" href={wa} tabIndex={tab}>
            WhatsApp
          </a>
        </>
      ) : (
        <a className="btn-primary" href="#contact" tabIndex={tab}>
          Message us
        </a>
      )}
    </aside>
  );
}
