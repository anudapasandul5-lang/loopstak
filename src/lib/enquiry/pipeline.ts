import { toSummaryInput } from "./adapters.ts";
import type { Adapters } from "./adapters.ts";
import type { EnquiryConfig } from "./config.ts";
import type { Lead } from "../lead.ts";
import { serviceName } from "../services.ts";

export type EnquiryResult = { status: "ok" } | { status: "failed" } | { status: "unavailable" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
/** Stop spreadsheet apps treating user text as a formula. */
const safeCell = (s: string) => (/^[=+\-@\t\r]/.test(s) ? `'${s}` : s);

/** Fixed template text. Never AI-written, never contains the summary. */
export function clientReplyText(lead: Lead, config: EnquiryConfig): string {
  const service = serviceName(lead.service);
  const lines = [
    `Hi ${oneLine(lead.name)},`,
    "",
    lead.service === "not-sure"
      ? "Thanks for getting in touch with Loopstak. Your message has reached us."
      : `Thanks for your enquiry about ${service}. Your message has reached us.`,
    "We read every enquiry ourselves and will reply personally.",
  ];
  if (config.calLink) lines.push("", `If you would like to pick a time to talk, you can book one here: ${config.calLink}`);
  if (config.whatsapp) lines.push("", `You can also message us on WhatsApp: https://wa.me/${config.whatsapp}`);
  lines.push("", "Loopstak");
  return lines.join("\n");
}

export function ownerText(lead: Lead): string {
  return [
    "New Loopstak enquiry",
    `Name: ${lead.name}`,
    `Contact: ${lead.contact}`,
    `Service: ${serviceName(lead.service)}`,
    "",
    lead.message,
  ].join("\n");
}

function fail(step: string, err: unknown) {
  // Messages come from our adapters and never hold secrets; log only the message.
  console.error(`[enquiry] ${step} failed:`, err instanceof Error ? err.message : "unknown error");
}

/**
 * Orchestrates one enquiry. Anuda's channels (Telegram, owner email) decide success.
 * The client reply, the sheet row and the AI summary are best-effort.
 */
export async function runEnquiry(lead: Lead, adapters: Adapters, config: EnquiryConfig): Promise<EnquiryResult> {
  const { mailer, sheet, notifier, summariser } = adapters;
  const ownerMail = mailer && config.ownerEmail && config.from ? mailer : null;
  if (!notifier && !ownerMail) return { status: "unavailable" };

  const replyTo = EMAIL.test(lead.contact) ? lead.contact : undefined;
  const service = serviceName(lead.service);
  const ownerBody = ownerText(lead);
  const subject = oneLine(`Loopstak enquiry: ${service} (${lead.name})`);

  type Step = { name: string; anuda: boolean; run: () => Promise<void> };
  const steps: Step[] = [];

  if (mailer && config.from && replyTo) {
    steps.push({
      name: "client reply",
      anuda: false,
      run: () => mailer.send({
        to: replyTo,
        from: config.from,
        subject: "We got your message - Loopstak",
        text: clientReplyText(lead, config),
      }),
    });
  }
  if (sheet) {
    const row = [new Date().toISOString(), lead.name, lead.contact, service, lead.message].map(safeCell);
    steps.push({ name: "sheet row", anuda: false, run: () => sheet.append(row) });
  }
  if (notifier) steps.push({ name: "telegram", anuda: true, run: () => notifier.send(ownerBody) });
  if (ownerMail) {
    steps.push({
      name: "owner email",
      anuda: true,
      run: () => ownerMail.send({ to: config.ownerEmail, from: config.from, subject, text: ownerBody, replyTo }),
    });
  }

  const settled = await Promise.allSettled(steps.map((s) => Promise.resolve().then(s.run)));
  let anudaOk = false;
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      if (steps[i].anuda) anudaOk = true;
    } else {
      fail(steps[i].name, r.reason);
    }
  });

  if (summariser) {
    try {
      const summary = await summariser.summarise(toSummaryInput(lead));
      const text = `Summary and suggested next step (private, from Claude):\n\n${summary}`;
      // Owner channels only. The summary is never sent to the client.
      const sends: Promise<void>[] = [];
      if (notifier) sends.push(notifier.send(text));
      if (ownerMail) {
        sends.push(
          ownerMail.send({ to: config.ownerEmail, from: config.from, subject: `Summary: ${subject}`, text }),
        );
      }
      const out = await Promise.allSettled(sends);
      out.forEach((r) => r.status === "rejected" && fail("summary delivery", r.reason));
    } catch (err) {
      fail("summary", err);
    }
  }

  return { status: anudaOk ? "ok" : "failed" };
}
