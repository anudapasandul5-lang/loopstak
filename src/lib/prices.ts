import type { ServiceId } from "./services";

/*
  The one price source (PRD, issue #1). Two lists: LKR for clients in Sri Lanka, USD for everyone else.
  The USD list is its own list, not a conversion.
*/

export type PriceList = "lkr" | "usd";
export type PriceKey = ServiceId | "upkeep";

export type Price = {
  amount: number;
  currency: "LKR" | "USD";
  unit: string;
  /** extra terms that only apply to this list */
  note?: string;
};

export const PRICES: Record<PriceKey, Record<PriceList, Price>> = {
  website: {
    lkr: { amount: 35000, currency: "LKR", unit: "one-off", note: "50% up front, 50% when you approve the live site." },
    usd: { amount: 450, currency: "USD", unit: "one-off", note: "50% up front, 50% when you approve the live site." },
  },
  upkeep: {
    lkr: { amount: 7500, currency: "LKR", unit: "per month" },
    usd: { amount: 40, currency: "USD", unit: "per month" },
  },
  agents: {
    lkr: { amount: 40000, currency: "LKR", unit: "per month" },
    usd: { amount: 300, currency: "USD", unit: "per month" },
  },
  claude: {
    lkr: { amount: 20000, currency: "LKR", unit: "one-off" },
    usd: { amount: 150, currency: "USD", unit: "one-off" },
  },
  teaching: {
    lkr: { amount: 75000, currency: "LKR", unit: "per full day", note: "Transport outside Colombo is extra." },
    usd: { amount: 400, currency: "USD", unit: "per online full day", note: "In person abroad is quoted, plus travel." },
  },
};

/** Sri Lanka sees rupees. Every other country, and an unknown one, sees dollars. */
export function listForCountry(country: string | null | undefined): PriceList {
  return country?.trim().toUpperCase() === "LK" ? "lkr" : "usd";
}

export const formatAmount = (p: Price) => `${p.currency} ${p.amount.toLocaleString("en-US")}`;

/** Words a screen reader can say, e.g. "35,000 rupees, one-off". */
export const spokenPrice = (p: Price) =>
  `${p.amount.toLocaleString("en-US")} ${p.currency === "LKR" ? "rupees" : "US dollars"}, ${p.unit}`;

export const LIST_NOTE = "Rupee prices are for clients in Sri Lanka. Dollar prices are for clients outside Sri Lanka.";

/** Cookie set by src/proxy.ts from the visitor's country; read by the head script in layout.tsx. */
export const GEO_COOKIE = "ls_geo";
/** sessionStorage key for the visitor's own choice, remembered for the visit. */
export const LIST_OVERRIDE_KEY = "ls_list";
