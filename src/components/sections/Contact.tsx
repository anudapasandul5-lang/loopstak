"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ClayStage } from "@/components/clay/ClayStage";
import { ContactLoop } from "@/components/clay/scenes/ContactLoop";
import { LeadForm } from "@/components/LeadForm";
import { HOME, HOME_FAQ } from "@/content/copy";
import { BUILDER, SITE_NAME, ideaCallHref, whatsappHref } from "@/lib/site";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import styles from "./Contact.module.css";

/**
 * Contact. The small clay loop returns beside the form and rolls in as the section enters.
 * Anything inserted before this section (the "Who builds it" block) just needs to sit above it.
 */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, "contact", { start: "top 85%", end: "top 20%" });
  const c = HOME.contact;
  const wa = whatsappHref();
  const book = ideaCallHref();
  const external = /^https?:/.test(book);

  return (
    <section ref={ref} id="contact" className={styles.contact} aria-labelledby="contact-headline">
      <div className={styles.grid}>
        <div className={styles.stage}>
          <ClayStage
            scene={({ reduced }) => <ContactLoop reduced={reduced} />}
            still="/stills/loop.webp"
            label="The small clay loop, resting."
          />
        </div>

        <div className={styles.main}>
          <p className={styles.label}>{c.label}</p>
          <h2 id="contact-headline" className={styles.headline}>
            {c.headline}
          </h2>

          <p className={styles.text}>{c.ideaCall}</p>
          <a
            className="btn-primary"
            href={book}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {c.ideaCallCta}
          </a>

          {wa && (
            <div className={styles.block}>
              <p className={styles.text}>{c.whatsapp}</p>
              <a className="link-label" href={wa}>
                {c.whatsappCta}
              </a>
            </div>
          )}

          <div className={styles.block}>
            <p className={styles.text}>{c.formIntro}</p>
            <LeadForm whatsapp={wa} />
          </div>

          <p className={`${styles.text} ${styles.mockup}`}>{c.mockup}</p>
        </div>
      </div>

      <div className={styles.lower}>
        <div className={styles.faq}>
          {HOME_FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <footer className={styles.foot}>
          <Image src="/brand/loopstak-white.png" alt={SITE_NAME} width={880} height={210} />
          <p>
            <span translate="no">{SITE_NAME}</span> is built and run by {BUILDER}.
          </p>
          <p>
            <Link href="/privacy">How we handle your details</Link>
          </p>
        </footer>
      </div>
    </section>
  );
}
