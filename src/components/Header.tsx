"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/lib/services";
import { Cta } from "@/components/Cta";
import { IDEA_CALL_LABEL, SITE_NAME, ideaCallHref, whatsappHref } from "@/lib/site";

const PLACES = [
  ["/#work", "Work"],
  ["/#process", "How it works"],
  ["/#prices", "Prices"],
  ["/#keys", "What you own"],
  ["/#contact", "Contact"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const call = ideaCallHref();
  const wa = whatsappHref();

  // full-screen menu: traps focus, closes on Escape, hands focus back to the button
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    panel.current?.querySelector<HTMLElement>("a[href]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !panel.current || !button.current) return;
      const items = [button.current, ...panel.current.querySelectorAll<HTMLElement>("a[href], button")];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    document.addEventListener("keydown", onKey);
    const btn = button.current;
    return () => {
      root.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/" className="mark" aria-label={`${SITE_NAME}, home`} onClick={close}>
          <Image src="/brand/loopstak-white.png" alt="" width={880} height={210} priority />
        </Link>
        <div className="topbar-act">
          <Cta href={call} size="sm" className="topbar-cta">
            {IDEA_CALL_LABEL}
          </Cta>
          <button
            ref={button}
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="menu-btn-label">{open ? "Close" : "Menu"}</span>
            <span className="menu-btn-icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="menu" ref={panel} className={`menu${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" inert={!open}>
        <div className="menu-in">
          <nav aria-label="Services" className="menu-services">
            <ul>
              {SERVICES.map((s, i) => (
                <li key={s.id} style={{ "--i": i } as React.CSSProperties}>
                  <Link href={`/${s.slug}`} onClick={close}>
                    <span className="menu-n">{s.n}</span>
                    <span className="menu-name">{s.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu-side">
            <nav aria-label="On the home page">
              <ul>
                <li>
                  <Link href="/" onClick={close}>
                    Home
                  </Link>
                </li>
                {PLACES.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} onClick={close}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="menu-cta">
              <Cta href={call} onClick={close}>
                {IDEA_CALL_LABEL}
              </Cta>
              {wa && (
                <Cta href={wa} kind="ghost" onClick={close}>
                  Message us on WhatsApp
                </Cta>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
