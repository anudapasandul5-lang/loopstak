export const SITE_NAME = "Loopstak";
export const BUILDER = "Anuda Pasandul";

/** wa.me link, or null when no number is configured. */
export function whatsappHref(text = "Hi Loopstak, I’d like to talk about a project."): string | null {
  const n = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

/** Booking page for the free Idea call, only if it is a real https link. */
function calHref(): string | null {
  const raw = (process.env.NEXT_PUBLIC_CAL_URL ?? "").trim();
  try {
    return raw && new URL(raw).protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

/**
 * The free first step. Cal.com when configured, then WhatsApp, then the on-page form.
 * Never a dead button.
 */
export function ideaCallHref(): string {
  return calHref() ?? whatsappHref("Hi Loopstak, I’d like to book a free Idea call.") ?? "/#contact";
}

export const IDEA_CALL_LABEL = "Book a free Idea call";

export type Work = { name: string; host: string; href: string; src: string; kind: "Client" | "Own venture"; note: string };

/* Real, live sites built by the owner before Loopstak had a name. No quotes or metrics: none exist. */
export const WORK: Work[] = [
  { name: "FLOST8", host: "flost8.lk", href: "https://flost8.lk", src: "/work/flost8.jpg", kind: "Client", note: "A Sri Lankan DJ agency. Fans see upcoming shows. Promoters pick a date and book an artist." },
  { name: "Rama Shala", host: "sriramashala.com", href: "https://sriramashala.com", src: "/work/ramashala.jpg", kind: "Client", note: "A yoga and wellness retreat. Guests book rooms, workshops and massages, and pay online." },
  { name: "The Edited Wild", host: "editedwild.com", href: "https://editedwild.com", src: "/work/editedwild.jpg", kind: "Client", note: "A travel and food magazine, live and publishing." },
  { name: "Hyrefi", host: "hyrefi.com", href: "https://hyrefi.com", src: "/work/hyrefi.jpg", kind: "Own venture", note: "A startup our founder co-owns, connecting Sri Lankan tech talent with employers." },
  { name: "Frontier Football", host: "frontier-football.vercel.app", href: "https://frontier-football.vercel.app", src: "/work/frontier.jpg", kind: "Own venture", note: "Our founder’s small-sided football community in Colombo: leagues, events and partner sign-ups." },
];
