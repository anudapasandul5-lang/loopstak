import { validateLead } from "@/lib/lead";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const result = validateLead(body);
  if (!result.ok) {
    // Honeypot hits get a silent success so bots learn nothing.
    if (result.error === "rejected") return Response.json({ ok: true });
    return Response.json({ error: result.error }, { status: 422 });
  }

  const { RESEND_API_KEY, LEAD_NOTIFY_TO, LEAD_FROM } = process.env;
  if (!RESEND_API_KEY || !LEAD_NOTIFY_TO || !LEAD_FROM) {
    // Never pretend a lead was delivered when it was not.
    return Response.json(
      { error: "The form is not switched on yet." },
      { status: 503 },
    );
  }

  const { name, contact, need, message } = result.lead;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: LEAD_FROM,
      to: [LEAD_NOTIFY_TO],
      subject: `Loopstak inquiry: ${need} (${name})`,
      text: `Name: ${name}\nContact: ${contact}\nNeed: ${need}\n\n${message}`,
      ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? { reply_to: contact } : {}),
    }),
  });

  if (!res.ok) {
    return Response.json(
      { error: "Could not send right now. Try again in a minute." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
