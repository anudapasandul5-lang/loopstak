"use client";

import { useEffect, useState } from "react";
import { PRICE_LIST_STORAGE_KEY, priceListFor } from "./prices";
import type { PriceListId } from "./prices";

function readOverride(): PriceListId | null {
  try {
    const v = sessionStorage.getItem(PRICE_LIST_STORAGE_KEY);
    return v === "LKR" || v === "USD" ? v : null;
  } catch {
    return null;
  }
}

/**
 * The visitor's price list: LKR for Sri Lanka, USD otherwise. A choice made earlier in this
 * visit (sessionStorage) wins over the detected country. Shared by the home Prices tabs and the Service pages.
 */
export function usePriceList(country: string | null): { list: PriceListId; choose: (next: PriceListId) => void } {
  const [list, setList] = useState<PriceListId>(priceListFor(country));

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

  return { list, choose };
}
