/**
 * The one price source. Every amount on the site lives here and nowhere else.
 * Plain TypeScript with relative imports only, so Node can run it in tests.
 */

export type ServiceId = "website-design" | "ai-agents-automation" | "claude-integration" | "ai-teaching";
export type PriceListId = "LKR" | "USD";

export type PriceEntry = {
  amount: number | null;
  currency: "LKR" | "USD";
  unit: string;
  included: string[];
  excluded: string[];
  note?: string;
  /** Optional extra sold with the Service (Upkeep under Website design). */
  addOn?: PriceEntry & { name: string };
};

export const SERVICE_IDS: ServiceId[] = [
  "website-design",
  "ai-agents-automation",
  "claude-integration",
  "ai-teaching",
];

/** sessionStorage key for the visitor's price list toggle ("remembered for the visit"). Client-safe. */
export const PRICE_LIST_STORAGE_KEY = "loopstak-price-list";

const WEBSITE_INCLUDED = ["A website of up to 5 pages", "Domain, hosting and logins in your name"];
const UPKEEP_INCLUDED = ["Your website kept updated and running"];
const AGENTS_INCLUDED = ["Up to 3 running automations", "One new automation or change per month"];
const AGENTS_EXCLUDED = ["AI usage fees (you pay them in your own accounts)"];
const CLAUDE_INCLUDED = ["Team setup with Projects and docs", "Up to 2 tool connections", "A 1-hour handover"];
const CLAUDE_EXCLUDED = ["Your own Claude plan"];

export const PRICES: Record<PriceListId, Record<ServiceId, PriceEntry>> = {
  LKR: {
    "website-design": {
      amount: 35000,
      currency: "LKR",
      unit: "one-off",
      included: WEBSITE_INCLUDED,
      excluded: [],
      addOn: {
        name: "Upkeep",
        amount: 7500,
        currency: "LKR",
        unit: "per month",
        included: UPKEEP_INCLUDED,
        excluded: [],
      },
    },
    "ai-agents-automation": {
      amount: 40000,
      currency: "LKR",
      unit: "per month",
      included: AGENTS_INCLUDED,
      excluded: AGENTS_EXCLUDED,
    },
    "claude-integration": {
      amount: 20000,
      currency: "LKR",
      unit: "one-off",
      included: CLAUDE_INCLUDED,
      excluded: CLAUDE_EXCLUDED,
    },
    "ai-teaching": {
      amount: 75000,
      currency: "LKR",
      unit: "per full-day session",
      included: ["A full-day session for up to 15 people"],
      excluded: ["Transport outside Colombo"],
    },
  },
  USD: {
    "website-design": {
      amount: 450,
      currency: "USD",
      unit: "one-off",
      included: WEBSITE_INCLUDED,
      excluded: [],
      addOn: {
        name: "Upkeep",
        amount: 40,
        currency: "USD",
        unit: "per month",
        included: UPKEEP_INCLUDED,
        excluded: [],
      },
    },
    "ai-agents-automation": {
      amount: 300,
      currency: "USD",
      unit: "per month",
      included: AGENTS_INCLUDED,
      excluded: AGENTS_EXCLUDED,
    },
    "claude-integration": {
      amount: 150,
      currency: "USD",
      unit: "one-off",
      included: CLAUDE_INCLUDED,
      excluded: CLAUDE_EXCLUDED,
    },
    "ai-teaching": {
      amount: 400,
      currency: "USD",
      unit: "per online full day",
      included: ["A full online day for up to 15 people"],
      excluded: ["Travel for in-person sessions abroad"],
      note: "In-person sessions abroad are quoted separately, plus travel.",
    },
  },
};

/** Sri Lanka (LK) gets the LKR list. Anyone else, or an unknown country, gets USD. An override wins. */
export function priceListFor(country: string | null | undefined, override?: PriceListId | null): PriceListId {
  if (override === "LKR" || override === "USD") return override;
  return typeof country === "string" && country.trim().toUpperCase() === "LK" ? "LKR" : "USD";
}

export function getPrice(service: ServiceId, country: string | null | undefined, override?: PriceListId | null): PriceEntry {
  return PRICES[priceListFor(country, override)][service];
}

/** "LKR 35,000" / "USD 450". A null amount (none today) reads as a quote. */
export function formatPrice(entry: Pick<PriceEntry, "amount" | "currency">): string {
  if (entry.amount === null) return "Quoted";
  return `${entry.currency} ${new Intl.NumberFormat("en-US").format(entry.amount)}`;
}
