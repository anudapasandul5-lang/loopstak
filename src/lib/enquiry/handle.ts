import type { Adapters } from "./adapters.ts";
import type { EnquiryConfig } from "./config.ts";
import { runEnquiry } from "./pipeline.ts";
import { createRateLimiter } from "./rate-limit.ts";
import type { RateLimiter } from "./rate-limit.ts";
import { validateLead } from "../lead.ts";

export type HandleResult = { status: number; body: Record<string, unknown> };

const sharedLimiter = createRateLimiter(5, 10 * 60 * 1000);

/** Everything the route does after parsing JSON, so tests can call it without HTTP. */
export async function handleEnquiry(
  rawBody: unknown,
  ip: string,
  adapters: Adapters,
  config: EnquiryConfig,
  limiter: RateLimiter = sharedLimiter,
): Promise<HandleResult> {
  const checked = validateLead(rawBody);
  if (!checked.ok) {
    // Honeypot hits get a silent success so bots learn nothing. Nothing is sent.
    if (checked.error === "rejected") return { status: 200, body: { ok: true } };
    return { status: 422, body: { error: checked.error, field: checked.field } };
  }

  if (!limiter.allow(ip)) {
    return { status: 429, body: { error: "Too many messages from here. Please try again in a few minutes." } };
  }

  const result = await runEnquiry(checked.lead, adapters, config);
  if (result.status === "ok") return { status: 200, body: { ok: true } };
  if (result.status === "unavailable") {
    return {
      status: 503,
      body: { error: "The form is not switched on yet. Please message us on WhatsApp.", unavailable: true },
    };
  }
  return { status: 502, body: { error: "Could not send right now. Try again in a minute." } };
}
