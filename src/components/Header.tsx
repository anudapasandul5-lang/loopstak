"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HOME } from "@/content/copy";
import { SERVICES } from "@/lib/services";
import { SITE_NAME, ideaCallHref, primaryCta } from "@/lib/site";

const MENU_ID = "site-menu";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const cta = primaryCta();
  const book = ideaCallHref();
  const bookExternal = /^https?:/.test(book);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const ov = overlay.current;
    if (!open || !ov) {
      // return focus to the button after closing (not on first render)
      if (wasOpen.current) button.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;

    // lock page scroll and make everything else inert
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const inerted: Element[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el !== ov && !el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        inerted.push(el);
      }
    }
    ov.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(ov.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !ov.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !ov.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      inerted.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link href="/" className="mark" aria-label={`${SITE_NAME}, home`}>
            <Image src="/brand/loopstak-white.png" alt="" width={880} height={210} priority />
          </Link>
          <div className="topbar-actions">
            <a className="pill" href={cta.href}>
              {cta.label}
            </a>
            <button
              ref={button}
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls={MENU_ID}
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <div
        ref={overlay}
        id={MENU_ID}
        className="menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
      >
        <div className="menu-top">
          <Link href="/" className="mark" aria-label={`${SITE_NAME}, home`} onClick={close}>
            <Image src="/brand/loopstak-white.png" alt="" width={880} height={210} />
          </Link>
          <button type="button" className="menu-btn" onClick={close}>
            Close
          </button>
        </div>
        <nav aria-label="Menu" className="menu-nav">
          <ul>
            <li>
              <Link href="/" onClick={close}>
                Home
              </Link>
            </li>
            {SERVICES.slice(0, 4).map((s) => (
              <li key={s.id}>
                <Link href={`/${s.slug}`} onClick={close}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          className="btn-primary menu-cta"
          href={book}
          onClick={close}
          {...(bookExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {HOME.hero.primaryCta}
        </a>
      </div>
    </>
  );
}
