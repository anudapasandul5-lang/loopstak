import test from "node:test";
import assert from "node:assert/strict";
import { NOT_SURE, validateLead } from "../src/lib/lead.ts";

const good = { name: "Nimal", contact: "nimal@example.com", service: "Website design", message: "Salon site please" };

test("accepts a valid enquiry with email or phone", () => {
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

test("keeps a known Service and treats anything else as not sure", () => {
  const svc = (x: unknown) => {
    const r = validateLead(x);
    return r.ok ? r.lead.service : null;
  };
  assert.equal(svc(good), "Website design");
  assert.equal(svc({ ...good, service: "Claude integration" }), "Claude integration");
  assert.equal(svc({ ...good, service: "<script>" }), NOT_SURE);
  assert.equal(svc({ ...good, service: undefined }), NOT_SURE);
});

test("names the field at fault so the form can show the error beside it", () => {
  const field = (x: unknown) => {
    const r = validateLead(x);
    return r.ok ? null : r.field;
  };
  assert.equal(field({ ...good, name: "N" }), "name");
  assert.equal(field({ ...good, contact: "hello" }), "contact");
  assert.equal(field({ ...good, message: "hi" }), "message");
});
