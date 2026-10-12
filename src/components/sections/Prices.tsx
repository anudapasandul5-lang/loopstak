"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { HOME } from "@/content/copy";
import { PRICE_LIST_STORAGE_KEY, PRICES, SERVICE_IDS, formatPrice, priceListFor } from "@/lib/prices";
import type { PriceEntry, PriceListId, ServiceId } from "@/lib/prices";
import { ideaCallHref } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import styles from "./Prices.module.css";

const LISTS: PriceListId[] = ["LKR", "USD"];
const nameOf = (id: ServiceId) => SERVICES.find((s) => s.id === id)?.name ?? id;

function readOverride(): PriceListId | null {
  try {
    const v = sessionStorage.getItem(PRICE_LIST_STORAGE_KEY);
    return v === "LKR" || v === "USD" ? v : null;
  } catch {
    return null;
  }
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className={styles.listTitle}>{title}</h4>
      <ul className={styles.list}>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function Figure({ entry }: { entry: PriceEntry }) {
  return (
    <p className={styles.figure}>
      <span className={styles.amount}>{formatPrice(entry)}</span>
      <span className={styles.unit}>{entry.unit}</span>
    </p>
  );
}

/** Prices as WAI-ARIA tabs, one per Service. `country` is the server-detected visitor country. */
export function Prices({ country }: { country: string | null }) {
  const [list, setList] = useState<PriceListId>(priceListFor(country));
  const [active, setActive] = useState<ServiceId>(SERVICE_IDS[0]);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const book = ideaCallHref();
  const external = /^https?:/.test(book);

  // A choice made earlier in this visit wins over the detected country.
  useEffect(() => {
    const saved = readOverride();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage exists only in the browser
    if (saved) setList(saved);
  }, []);

  function choose(next: PriceListId) {
    setList(next);
    try {
      sessionStorage.setItem(PRICE_LIST_STORAGE_KEY, next);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  }

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

        <div className={styles.toggle} role="group" aria-label={HOME.prices.toggleLabel}>
          <span className={styles.toggleLabel} aria-hidden="true">
            {HOME.prices.toggleLabel}
          </span>
          {LISTS.map((l) => (
            <button key={l} type="button" aria-pressed={list === l} onClick={() => choose(l)}>
              {l}
            </button>
          ))}
        </div>
        <p className={styles.note}>{HOME.prices.currencyNote}</p>

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

        {SERVICE_IDS.map((id) => {
          const e = PRICES[list][id];
          return (
            <div
              key={id}
              id={`price-panel-${id}`}
              role="tabpanel"
              aria-labelledby={`price-tab-${id}`}
              hidden={active !== id}
              tabIndex={0}
              className={styles.panel}
            >
              <Figure entry={e} />
              {e.note && <p className={styles.noteLine}>{e.note}</p>}
              <div className={styles.lists}>
                <List title="Included" items={e.included} />
                <List title="Not included" items={e.excluded} />
              </div>
              {e.addOn && (
                <div className={styles.addOn}>
                  <h3 className={styles.addOnName}>Optional add-on: {e.addOn.name}</h3>
                  <Figure entry={e.addOn} />
                  <List title="Included" items={e.addOn.included} />
                </div>
              )}
              <a
                className="btn-primary"
                href={book}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                Book a free Idea call →
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
