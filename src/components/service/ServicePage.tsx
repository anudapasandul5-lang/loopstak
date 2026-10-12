import Link from "next/link";
import { HOME, type Service } from "@/content/copy";
import { LeadForm } from "@/components/LeadForm";
import { ideaCallHref, whatsappHref } from "@/lib/site";
import type { ServiceId } from "@/lib/prices";
import { ServiceHeroStage, ServicePrice } from "./ServiceClient";
import { ServiceStory, type ServiceStoryDef } from "./ServiceStory";
import styles from "./ServicePage.module.css";

// Short UI strings that are not in copy.ts.
const UI = {
  back: "← Back to home",
  story: "Built slab by slab →",
  whoFor: "Who it is for →",
  included: "What is included →",
  proof: "Proof →",
  proofLink: "See live sites →",
  faqs: "Questions →",
};

/**
 * Reusable Service page. Hero, scroll story (optional), who it is for, what is included, price,
 * related proof, FAQs, contact. All words come from the Service copy; the price from the price module.
 */
export function ServicePage({
  service,
  story,
  country,
}: {
  service: Service;
  story?: ServiceStoryDef;
  country: string | null;
}) {
  const { page } = service;
  const book = ideaCallHref();
  const external = /^https?:/.test(book);
  const wa = whatsappHref(`Hi Loopstak, I’d like to talk about ${service.name.toLowerCase()}.`);
  const hasProof = service.slug !== "ai-teaching"; // its proof line says there is nothing to show yet

  return (
    <>
      <section className={styles.hero} aria-labelledby="svc-title">
        <div className={styles.heroCopy}>
          <Link className={styles.back} href="/">
            {UI.back}
          </Link>
          <p className={styles.label}>
            {service.number} {service.name} →
          </p>
          <h1 id="svc-title" className={styles.heroTitle}>
            {page.heroLine}
          </h1>
          <p className={styles.heroSub}>{page.heroSub}</p>
          <div className={styles.actions}>
            <a
              className="btn-primary"
              href={book}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              Book a free Idea call →
            </a>
          </div>
        </div>
        <ServiceHeroStage story={story} name={service.name} />
      </section>

      {story && <ServiceStory story={story} label={UI.story} caption={page.heroSub} section={service.slug} />}

      <section className={styles.sec} aria-labelledby="svc-who">
        <div className={styles.inner}>
          <h2 id="svc-who" className={styles.label}>
            {UI.whoFor}
          </h2>
          {page.whoFor.map((t) => (
            <p key={t} className={styles.statement}>
              {t}
            </p>
          ))}
        </div>
      </section>

      <section className={styles.sec} aria-labelledby="svc-included">
        <div className={styles.inner}>
          <h2 id="svc-included" className={styles.label}>
            {UI.included}
          </h2>
          <ul className={styles.rows}>
            {page.included.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="price" className={styles.sec} aria-labelledby="svc-price">
        <div className={styles.inner}>
          <h2 id="svc-price" className={styles.label}>
            {HOME.prices.label}
          </h2>
          <p className={styles.statement}>{page.priceNote}</p>
          <ServicePrice serviceId={service.slug} country={country} />
          <div className={styles.actions}>
            <a
              className="btn-primary"
              href={book}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              Book a free Idea call →
            </a>
          </div>
        </div>
      </section>

      <section className={styles.sec} aria-labelledby="svc-proof">
        <div className={styles.inner}>
          <h2 id="svc-proof" className={styles.label}>
            {UI.proof}
          </h2>
          <p className={styles.statement}>{page.proof}</p>
          {hasProof && (
            <div className={styles.actions}>
              <Link className="link-label" href="/#work">
                {UI.proofLink}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className={styles.sec} aria-labelledby="svc-faq">
        <div className={styles.inner}>
          <h2 id="svc-faq" className={styles.label}>
            {UI.faqs}
          </h2>
          <div className={styles.faqs}>
            {page.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={styles.sec} aria-labelledby="svc-contact">
        <div className={styles.inner}>
          <h2 id="svc-contact" className={styles.label}>
            {HOME.contact.label}
          </h2>
          <p className={styles.statement}>{page.contact}</p>
          <div className={styles.actions}>
            <a
              className="btn-primary"
              href={book}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {HOME.contact.ideaCallCta}
            </a>
            {wa && (
              <a className="link-label" href={wa}>
                {HOME.contact.whatsappCta}
              </a>
            )}
          </div>
          <p className={styles.formIntro}>{HOME.contact.formIntro}</p>
          <LeadForm whatsapp={wa} defaultService={service.slug as ServiceId} />
          <Link className={`link-label ${styles.backEnd}`} href="/">
            {UI.back}
          </Link>
        </div>
      </section>
    </>
  );
}
