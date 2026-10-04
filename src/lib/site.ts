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

export const OFFERS: Offer[] = [
  {
    id: "build",
    name: "Website build",
    lkr: 35000,
    cadence: "one-off",
    blurb:
      "Built for the phone your customers hold, with a WhatsApp button and a form that lands in your inbox.",
  },
  {
    id: "upkeep",
    name: "Upkeep",
    lkr: 30000,
    cadence: "per month",
    blurb: "New prices, new photos, a broken link. Send a message and I'll handle it.",
  },
  {
    id: "automations",
    name: "Automations",
    lkr: 40000,
    cadence: "per month",
    blurb:
      "When a customer messages at 11pm, a workflow replies and follows up. I build it and keep an eye on it.",
  },
];

export const toUsd = (lkr: number) => Math.round(lkr / LKR_PER_USD);

/** wa.me link, or null when no number is configured. */
export function whatsappHref(text = "Hi Loopstak, I'd like a website."): string | null {
  const n = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

/** Primary action: WhatsApp when configured, otherwise the on-page form. Never a dead button. */
export function primaryCta(long = false) {
  const wa = whatsappHref();
  return wa
    ? { href: wa, label: long ? "Message me on WhatsApp" : "Message me" }
    : { href: "#contact", label: long ? "Send me a message" : "Message me" };
}
