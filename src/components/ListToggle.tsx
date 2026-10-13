"use client";

import { useSyncExternalStore } from "react";
import { LIST_NOTE, LIST_OVERRIDE_KEY, type PriceList } from "@/lib/prices";

const EVENT = "ls-list";
const read = (): PriceList => (document.documentElement.dataset.list === "lkr" ? "lkr" : "usd");
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

function pick(list: PriceList) {
  const root = document.documentElement;
  if (root.dataset.list === list) return;
  // rupee amounts are bigger numbers: digits roll up to LKR, down to USD (SmoothUI Price Flow pattern)
  root.dataset.roll = list === "lkr" ? "up" : "down";
  root.dataset.list = list;
  try {
    sessionStorage.setItem(LIST_OVERRIDE_KEY, list);
  } catch {
    /* private mode: the choice lasts until the page reloads */
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * LKR / USD switch. The visitor's choice wins over their country and lasts for the visit.
 * Sliding pill after SmoothUI's Animated Tabs, segment variant (MIT), done in CSS.
 */
export function ListToggle() {
  const list = useSyncExternalStore(subscribe, read, () => "usd" as PriceList);
  return (
    <div className="list-toggle">
      <div className="seg" role="group" aria-label="Price list" data-on={list}>
        <span className="seg-pill" aria-hidden="true" />
        {(["lkr", "usd"] as const).map((l) => (
          <button key={l} type="button" aria-pressed={list === l} onClick={() => pick(l)}>
            {l === "lkr" ? "LKR, Sri Lanka" : "USD, everywhere else"}
          </button>
        ))}
      </div>
      <p className="list-note">{LIST_NOTE}</p>
    </div>
  );
}
