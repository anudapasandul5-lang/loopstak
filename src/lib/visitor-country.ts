import { headers } from "next/headers";

// Client code: import the storage key from "./prices" directly, so next/headers stays out of the browser bundle.
export { PRICE_LIST_STORAGE_KEY } from "./prices";

/** Visitor country code from Vercel's geo header, or null when absent (local dev, unknown). Server only. */
export async function visitorCountry(): Promise<string | null> {
  const code = (await headers()).get("x-vercel-ip-country")?.trim();
  return code ? code.toUpperCase() : null;
}
