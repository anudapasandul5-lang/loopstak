"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { HOME } from "@/content/copy";
import { PRICES, SERVICE_IDS } from "@/lib/prices";
import type { ServiceId } from "@/lib/prices";
import { usePriceList } from "@/lib/use-price-list";
import { ideaCallHref } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { PriceBody, PriceToggle } from "./PriceParts";
import styles from "./Prices.module.css";

const nameOf = (id: ServiceId) => SERVICES.find((s) => s.id === id)?.name ?? id;

/** Prices as WAI-ARIA tabs, one per Service. `country` is the server-detected visitor country. */
export function Prices({ country }: { country: string | null }) {
  const { list, choose } = usePriceList(country);
  const [active, setActive] = useState<ServiceId>(SERVICE_IDS[0]);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const book = ideaCallHref();
  const external = /^https?:/.test(book);

  function onKey(e: KeyboardEvent, i: number) {
    const last = SERVICE_IDS.length - 1;
    const to = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setActive(SERVICE_IDS[to]);
    tabs.current[to]?.focus();
  }

  return (
    <section id="prices" className={styles.section} aria-labelledby="prices-title">
      <div className={styles.inner}>
        <h2 id="prices-title" className={styles.label}>
          {HOME.prices.label}
        </h2>
        <p className={styles.intro}>{HOME.prices.intro}</p>

        <PriceToggle list={list} onChoose={choose} />

        <div className={styles.tablist} role="tablist" aria-label="Services">
          {SERVICE_IDS.map((id, i) => (
            <button
              key={id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`price-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={active === id}
              aria-controls={`price-panel-${id}`}
              tabIndex={active === id ? 0 : -1}
              onClick={() => setActive(id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {nameOf(id)}
            </button>
          ))}
        </div>

        {SERVICE_IDS.map((id) => (
          <div
            key={id}
            id={`price-panel-${id}`}
            role="tabpanel"
            aria-labelledby={`price-tab-${id}`}
            hidden={active !== id}
            tabIndex={0}
            className={styles.panel}
          >
            <PriceBody entry={PRICES[list][id]} />
            <a
              className="btn-primary"
              href={book}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              Book a free Idea call →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
