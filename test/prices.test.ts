import test from "node:test";
import assert from "node:assert/strict";
import { PRICES, formatAmount, listForCountry } from "../src/lib/prices.ts";
import { SERVICES } from "../src/lib/services.ts";

test("Sri Lanka sees rupees; every other or unknown country sees dollars", () => {
  assert.equal(listForCountry("LK"), "lkr");
  assert.equal(listForCountry("lk "), "lkr");
  for (const c of ["US", "GB", "IN", "AU", "", null, undefined]) assert.equal(listForCountry(c), "usd");
});

test("every Service has a price in both lists, in the right currency", () => {
  for (const s of SERVICES) {
    assert.equal(PRICES[s.id].lkr.currency, "LKR", s.id);
    assert.equal(PRICES[s.id].usd.currency, "USD", s.id);
    assert.ok(PRICES[s.id].lkr.amount > 0 && PRICES[s.id].usd.amount > 0, s.id);
    assert.ok(s.page.included.length > 0, `${s.id} lists what is included`);
  }
});

test("prices match the PRD", () => {
  const got = Object.fromEntries(Object.entries(PRICES).map(([k, v]) => [k, [v.lkr.amount, v.usd.amount]]));
  assert.deepEqual(got, {
    website: [35000, 450],
    upkeep: [7500, 40],
    agents: [40000, 300],
    claude: [20000, 150],
    teaching: [75000, 400],
  });
});

test("formats with the currency code and thousands separators", () => {
  assert.equal(formatAmount(PRICES.website.lkr), "LKR 35,000");
  assert.equal(formatAmount(PRICES.website.usd), "USD 450");
});
