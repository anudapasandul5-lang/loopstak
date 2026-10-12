import type { LeadField } from "./lead.ts";

export type Outcome =
  | { kind: "done" }
  | { kind: "field"; field: LeadField; msg: string }
  | { kind: "unavailable"; msg: string }
  | { kind: "error"; msg: string };

export const SEND_FAILED = "Could not send that. Check your connection and try again.";
export const UNAVAILABLE = "The form is not switched on yet. Please message us on WhatsApp.";
const FIELDS: string[] = ["name", "contact", "message", "service"];

/** Map the /api/lead response (status + parsed JSON) to what the form should show. */
export function outcomeFromResponse(status: number, json: unknown): Outcome {
  const j = (json && typeof json === "object" ? json : {}) as Record<string, unknown>;
  const msg = typeof j.error === "string" && j.error ? j.error : SEND_FAILED;
  if (status >= 200 && status < 300) return { kind: "done" };
  if (status === 503 && j.unavailable === true) return { kind: "unavailable", msg: UNAVAILABLE };
  if (status === 422 && typeof j.field === "string" && FIELDS.includes(j.field)) {
    return { kind: "field", field: j.field as LeadField, msg };
  }
  return { kind: "error", msg };
}

export const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function thanksText(name: string, contact: string): string {
  const base = `Thanks, ${name.trim()}. We got your message.`;
  return looksLikeEmail(contact) ? `${base} Check your inbox for our reply.` : base;
}
