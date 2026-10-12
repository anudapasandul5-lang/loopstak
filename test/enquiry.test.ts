import test from "node:test";
import assert from "node:assert/strict";
import { handleEnquiry } from "../src/lib/enquiry/handle.ts";
import { runEnquiry } from "../src/lib/enquiry/pipeline.ts";
import { createRateLimiter } from "../src/lib/enquiry/rate-limit.ts";
import { buildAdapters } from "../src/lib/enquiry/config.ts";
import { buildSummaryPrompt, toSummaryInput } from "../src/lib/enquiry/adapters.ts";
import { validateLead } from "../src/lib/lead.ts";

const SUMMARY = "SECRET-SUMMARY-TEXT suggested next step: call them";
const config = {
  ownerEmail: "owner@example.com",
  from: "Loopstak <hello@example.com>",
  calLink: "https://cal.com/example/intro",
  whatsapp: "94770000000",
};
const body = {
  name: "Nimal",
  contact: "nimal@example.com",
  service: "website-design",
  message: "I run a salon in Galle and need a site",
};

function fakes(opts: { telegramFails?: boolean; mailFailsToOwner?: boolean; summaryFails?: boolean; none?: boolean } = {}) {
  const calls = {
    mail: [] as { to: string; subject: string; text: string; replyTo?: string }[],
    rows: [] as string[][],
    tg: [] as string[],
    summaryInputs: [] as unknown[],
  };
  const adapters = opts.none
    ? { mailer: null, sheet: null, notifier: null, summariser: null }
    : {
        mailer: {
          async send(m: { to: string; from: string; subject: string; text: string; replyTo?: string }) {
            calls.mail.push(m);
            if (opts.mailFailsToOwner && m.to === config.ownerEmail) throw new Error("mail down");
          },
        },
        sheet: {
          async append(row: string[]) {
            calls.rows.push(row);
          },
        },
        notifier: {
          async send(text: string) {
            calls.tg.push(text);
            if (opts.telegramFails) throw new Error("telegram down");
          },
        },
        summariser: {
          async summarise(input: unknown) {
            calls.summaryInputs.push(input);
            if (opts.summaryFails) throw new Error("claude down");
            return SUMMARY;
          },
        },
      };
  return { adapters, calls };
}

const quiet = <T,>(fn: () => Promise<T>) => {
  const orig = console.error;
  console.error = () => {};
  return fn().finally(() => {
    console.error = orig;
  });
};

test("valid enquiry: client reply, sheet row, telegram, owner email, summary to Anuda only", async () => {
  const { adapters, calls } = fakes();
  const r = await handleEnquiry(body, "1.1.1.1", adapters, config, createRateLimiter());
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true });

  const reply = calls.mail.find((m) => m.to === "nimal@example.com");
  assert.ok(reply, "client reply sent");
  assert.match(reply.text, /Nimal/);
  assert.match(reply.text, /Website design/);
  assert.match(reply.text, /cal\.com\/example\/intro/);
  assert.match(reply.text, /wa\.me\/94770000000/);
  assert.ok(!reply.text.includes("SECRET-SUMMARY"), "client reply never holds the summary");

  assert.equal(calls.rows.length, 1);
  assert.ok(calls.rows[0].includes("Nimal"));
  assert.ok(calls.tg[0].includes("Nimal"));
  assert.ok(calls.mail.some((m) => m.to === config.ownerEmail));

  // summary: telegram + owner email, never the client
  assert.ok(calls.tg.some((t) => t.includes("SECRET-SUMMARY")));
  const withSummary = calls.mail.filter((m) => m.text.includes("SECRET-SUMMARY"));
  assert.equal(withSummary.length, 1);
  assert.equal(withSummary[0].to, config.ownerEmail);
  assert.equal(calls.mail.filter((m) => m.to === "nimal@example.com").length, 1);
});

test("phone contact: no client email, still reaches Anuda", async () => {
  const { adapters, calls } = fakes();
  const r = await handleEnquiry({ ...body, contact: "+94 77 123 4567" }, "2.2.2.2", adapters, config, createRateLimiter());
  assert.equal(r.status, 200);
  assert.ok(calls.mail.every((m) => m.to === config.ownerEmail));
  assert.ok(calls.tg.length >= 1);
});

test("telegram failing still delivers the owner email and succeeds", async () => {
  const { adapters, calls } = fakes({ telegramFails: true });
  const r = await quiet(() => handleEnquiry(body, "3.3.3.3", adapters, config, createRateLimiter()));
  assert.equal(r.status, 200);
  assert.ok(calls.mail.some((m) => m.to === config.ownerEmail && m.subject.startsWith("Loopstak enquiry")));
});

test("all Anuda channels failing gives failed (502)", async () => {
  const { adapters } = fakes({ telegramFails: true, mailFailsToOwner: true });
  const r = await quiet(() => handleEnquiry(body, "4.4.4.4", adapters, config, createRateLimiter()));
  assert.equal(r.status, 502);
  assert.equal(r.body.ok, undefined);
});

test("summariser failing does not fail the enquiry", async () => {
  const { adapters } = fakes({ summaryFails: true });
  const r = await quiet(() => handleEnquiry(body, "5.5.5.5", adapters, config, createRateLimiter()));
  assert.equal(r.status, 200);
});

test("nothing configured: unavailable, zero calls, honest message", async () => {
  const { adapters, calls } = fakes({ none: true });
  const r = await handleEnquiry(body, "6.6.6.6", adapters, config, createRateLimiter());
  assert.equal(r.status, 503);
  assert.equal(r.body.unavailable, true);
  assert.match(String(r.body.error), /WhatsApp/);
  assert.equal(calls.mail.length + calls.rows.length + calls.tg.length, 0);

  // only a client-facing mailer exists (no Anuda channel): still sends nothing
  const lone = fakes();
  const res = await runEnquiry(validated(), { ...lone.adapters, notifier: null }, { ...config, ownerEmail: "" });
  assert.equal(res.status, "unavailable");
  assert.equal(lone.calls.mail.length, 0);
  assert.equal(lone.calls.rows.length, 0);
});

function validated() {
  const v = validateLead(body);
  assert.ok(v.ok);
  return v.lead;
}

test("honeypot and junk are rejected and the notifier is never called", async () => {
  const { adapters, calls } = fakes();
  const limiter = createRateLimiter();
  const bot = await handleEnquiry({ ...body, hp_url: "http://spam" }, "7.7.7.7", adapters, config, limiter);
  assert.equal(bot.status, 200); // silent success
  const bad = await handleEnquiry({ ...body, contact: "hello" }, "7.7.7.7", adapters, config, limiter);
  assert.equal(bad.status, 422);
  assert.equal(bad.body.field, "contact");
  const junk = await handleEnquiry(null, "7.7.7.7", adapters, config, limiter);
  assert.equal(junk.status, 422);
  const badService = await handleEnquiry({ ...body, service: "hack" }, "7.7.7.7", adapters, config, limiter);
  assert.equal(badService.status, 422);
  assert.equal(badService.body.field, "service");
  assert.equal(calls.tg.length + calls.mail.length + calls.rows.length + calls.summaryInputs.length, 0);
});

test("service defaults to not-sure; old need field still accepted", () => {
  const v = validateLead({ name: "Nimal", contact: "nimal@example.com", need: "A new website", message: "Salon site please" });
  assert.ok(v.ok);
  assert.equal(v.lead.service, "not-sure");
});

test("summary prompt contains only the enquiry fields", async () => {
  const { adapters, calls } = fakes();
  await handleEnquiry(body, "8.8.8.8", adapters, config, createRateLimiter());
  const input = calls.summaryInputs[0] as Record<string, string>;
  assert.deepEqual(Object.keys(input).sort(), ["contact", "message", "name", "service"]);
  const prompt = buildSummaryPrompt(toSummaryInput(validated()));
  const labels = prompt.split("\n").map((l) => l.split(":")[0]);
  assert.deepEqual(labels, ["New enquiry", "Name", "Contact", "Service", "Message"]);
  assert.ok(!/owner@example|cal\.com|api[_-]?key/i.test(prompt));
});

test("sheet cells cannot start a formula", async () => {
  const { adapters, calls } = fakes();
  await handleEnquiry({ ...body, name: "=HYPERLINK(1)" }, "9.9.9.9", adapters, config, createRateLimiter());
  assert.ok(calls.rows[0].includes("'=HYPERLINK(1)"));
});

test("rate limiter blocks the 6th call from one IP but not another", async () => {
  const { adapters } = fakes();
  const limiter = createRateLimiter(5, 10 * 60 * 1000);
  for (let i = 0; i < 5; i++) {
    assert.equal((await handleEnquiry(body, "10.0.0.1", adapters, config, limiter)).status, 200);
  }
  assert.equal((await handleEnquiry(body, "10.0.0.1", adapters, config, limiter)).status, 429);
  assert.equal((await handleEnquiry(body, "10.0.0.2", adapters, config, limiter)).status, 200);
});

test("rate limiter lets calls through again after the window", () => {
  let t = 0;
  const l = createRateLimiter(1, 1000, () => t);
  assert.equal(l.allow("a"), true);
  assert.equal(l.allow("a"), false);
  t = 1001;
  assert.equal(l.allow("a"), true);
});

test("adapters exist only when their env vars exist", () => {
  const none = buildAdapters({});
  assert.deepEqual(none, { mailer: null, notifier: null, summariser: null, sheet: null });
  const some = buildAdapters({ TELEGRAM_BOT_TOKEN: "x", TELEGRAM_CHAT_ID: "1", RESEND_API_KEY: "k" });
  assert.ok(some.notifier);
  assert.equal(some.mailer, null); // needs LEAD_FROM too
});
