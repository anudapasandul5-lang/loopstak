import test from "node:test";
import assert from "node:assert/strict";
import { validateLead } from "../src/lib/lead.ts";

const good = { name: "Nimal", contact: "nimal@example.com", need: "A new website", message: "Salon site please" };

test("accepts a valid inquiry with email or phone", () => {
  assert.equal(validateLead(good).ok, true);
  assert.equal(validateLead({ ...good, contact: "+94 77 123 4567" }).ok, true);
});

test("rejects bad contact, short name, empty message", () => {
  assert.equal(validateLead({ ...good, contact: "hello" }).ok, false);
  assert.equal(validateLead({ ...good, name: "N" }).ok, false);
  assert.equal(validateLead({ ...good, message: "hi" }).ok, false);
});

test("honeypot and junk input are rejected, not thrown", () => {
  assert.equal(validateLead({ ...good, hp_url: "http://spam" }).ok, false);
  assert.equal(validateLead(null).ok, false);
  assert.equal(validateLead("x").ok, false);
});

test("trims and caps field length", () => {
  const r = validateLead({ ...good, message: "  " + "a".repeat(5000) });
  assert.ok(r.ok && r.lead.message.length === 2000);
});
