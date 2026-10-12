export const SITE_NAME = "Loopstak";
export const BUILDER = "Anuda Pasandul";

/** Approximate LKR per USD, used only for the "≈" display. ponytail: static; wire a live rate if prices go USD-first. */
export const LKR_PER_USD = 300;

export type Offer = {
  id: "build" | "upkeep" | "automations";
  name: string;
  lkr: number;
  cadence: "one-off" | "per month";
  blurb: string;
};

/** The first offer is the headline one; the rest render as quiet add-ons. */
export const OFFERS: Offer[] = [
  {
    id: "build",
    name: "The Own-It Website",
    lkr: 35000,
    cadence: "one-off",
    blurb: "Found on Google. Live in 7 days.",
  },
  {
    id: "upkeep",
    name: "Upkeep",
    lkr: 7500,
    cadence: "per month",
    blurb: "New prices, new photos, a broken link. Send a message and we’ll handle it.",
  },
  {
    id: "automations",
    name: "Automations",
    lkr: 40000,
    cadence: "per month",
    blurb: "A customer messages at 11pm; a workflow replies and follows up.",
  },
];

export const INCLUDED = [
  "A mobile-first site, up to 5 pages",
  "WhatsApp button and inquiry form on every page",
  "Google Business Profile and Search Console set up or claimed",
  "Domain, hosting and every login in your name",
  "A walkthrough so you can make small changes yourself",
  "Live 7 days after you send photos and text",
];

export const toUsd = (lkr: number) => Math.round(lkr / LKR_PER_USD);

/** wa.me link, or null when no number is configured. */
export function whatsappHref(text = "Hi Loopstak, I’d like a website."): string | null {
  const n = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

/** Primary action: WhatsApp when configured, otherwise the on-page form. Never a dead button. */
export function primaryCta(long = false) {
  const wa = whatsappHref();
  return wa
    ? { href: wa, label: long ? "Message us on WhatsApp" : "Message us" }
    : { href: "/#contact", label: long ? "Send us a message" : "Message us" };
}

/** The free, low-commitment offer for visitors not ready to buy. Falls back to the form. */
export function freeCheckHref(): string {
  return (
    whatsappHref("Hi Loopstak, can you check what Google shows for my business? It’s called ") ?? "/#contact"
  );
}

/* Real, live sites built by the owner. No quotes or metrics: none exist. Order drives the 3D wall too. */
export const WORK = [
  { name: "Rama Shala", href: "https://sriramashala.com", src: "/work/ramashala.jpg", note: "A yoga and wellness retreat. Guests book rooms, workshops and massages, and pay online." },
  { name: "FLOST8", href: "https://flost8.lk", src: "/work/flost8.jpg", note: "A Sri Lankan DJ agency. Fans see upcoming shows; promoters pick a date and book an artist." },
  { name: "Frontier Football", href: "https://frontier-football.vercel.app", src: "/work/frontier.jpg", note: "Our founder’s own small-sided football community in Colombo: leagues, events and partner sign-ups." },
  { name: "The Edited Wild", href: "https://editedwild.com", src: "/work/editedwild.jpg", note: "A travel and food magazine, live and publishing." },
  { name: "Hyrefi", href: "https://hyrefi.com", src: "/work/hyrefi.jpg", note: "A startup our founder co-owns, connecting Sri Lankan tech talent with employers." },
];

/** Idea-call booking link (Cal.com), or the on-page form until it is configured. */
export function ideaCallHref(): string {
  return process.env.NEXT_PUBLIC_CAL_LINK || "/#contact";
}
