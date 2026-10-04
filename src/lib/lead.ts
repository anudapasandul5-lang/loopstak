export type Lead = {
  name: string;
  contact: string;
  need: string;
  message: string;
};


export type LeadField = "name" | "contact" | "message";
type Result = { ok: true; lead: Lead } | { ok: false; error: string; field?: LeadField };

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** Validate an untrusted inquiry. `website` is a honeypot: any value means a bot. */
export function validateLead(raw: unknown): Result {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (clean(b.hp_url, 200)) return { ok: false, error: "rejected" };

  const name = clean(b.name, 100);
  const contact = clean(b.contact, 150);
  const need = clean(b.need, 60);
  const message = clean(b.message, 2000);

  if (name.length < 2) return { ok: false, error: "Add your name so we know who to reply to.", field: "name" };
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = contact.replace(/\D/g, "").length >= 7;
  if (!isEmail && !isPhone) {
    return { ok: false, error: "Add a WhatsApp number or email so we can reply.", field: "contact" };
  }
  if (message.length < 5) return { ok: false, error: "Add a line about what the business sells.", field: "message" };

  return { ok: true, lead: { name, contact, need: need || "Not sure yet", message } };
}
