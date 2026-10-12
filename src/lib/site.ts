export const SITE_NAME = "Loopstak";
export const BUILDER = "Anuda Pasandul";

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
