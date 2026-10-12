import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PRICES, SERVICE_IDS, formatPrice, getPrice, priceListFor } from "../src/lib/prices.ts";

test("Sri Lanka gets LKR for every Service", () => {
  for (const s of SERVICE_IDS) {
    assert.equal(getPrice(s, "LK").currency, "LKR");
    assert.equal(getPrice(s, "lk").currency, "LKR");
  }
});

test("everyone else, and unknown, gets USD for every Service", () => {
  for (const s of SERVICE_IDS) {
    for (const c of ["US", "GB", "", null, undefined]) assert.equal(getPrice(s, c).currency, "USD");
  }
});

test("the toggle wins both ways", () => {
  assert.equal(priceListFor("LK", "USD"), "USD");
  assert.equal(priceListFor("US", "LKR"), "LKR");
  assert.equal(priceListFor(null, "LKR"), "LKR");
  assert.equal(priceListFor("LK", null), "LKR");
  for (const s of SERVICE_IDS) assert.equal(getPrice(s, "LK", "USD").currency, "USD");
});

test("every entry has an amount and at least one inclusion", () => {
  for (const list of ["LKR", "USD"] as const) {
    for (const s of SERVICE_IDS) {
      const e = PRICES[list][s];
      assert.equal(e.currency, list);
      assert.ok(typeof e.amount === "number" && e.amount > 0, `${list} ${s} amount`);
      assert.ok(e.included.length > 0, `${list} ${s} inclusions`);
      if (e.addOn) assert.ok(e.addOn.included.length > 0 && e.addOn.amount !== null);
    }
  }
});

test("amounts and units match the PRD", () => {
  const row = (l: "LKR" | "USD") => SERVICE_IDS.map((s) => [PRICES[l][s].amount, PRICES[l][s].unit]);
  assert.deepEqual(row("LKR"), [[35000, "one-off"], [40000, "per month"], [20000, "one-off"], [75000, "per full-day session"]]);
  assert.deepEqual(row("USD"), [[450, "one-off"], [300, "per month"], [150, "one-off"], [400, "per online full day"]]);
});

test("Upkeep is an add-on under Website design in both lists", () => {
  const k = (l: "LKR" | "USD") => PRICES[l]["website-design"].addOn;
  assert.deepEqual([k("LKR")?.name, k("LKR")?.amount, k("LKR")?.unit], ["Upkeep", 7500, "per month"]);
  assert.deepEqual([k("USD")?.name, k("USD")?.amount, k("USD")?.unit], ["Upkeep", 40, "per month"]);
});

test("USD teaching says in-person abroad is quoted plus travel", () => {
  assert.match(PRICES.USD["ai-teaching"].note ?? "", /quoted.*plus travel/i);
});

test("formatPrice groups thousands with a currency code prefix", () => {
  assert.equal(formatPrice(PRICES.LKR["website-design"]), "LKR 35,000");
  assert.equal(formatPrice(PRICES.USD["website-design"]), "USD 450");
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test("no price is hardcoded outside the price source", () => {
  const src = join(import.meta.dirname, "..", "src");
  const amounts = /(?<![\d,])(35,?000|7,?500|40,?000|20,?000|75,?000)(?!,?\d)/; // not inside e.g. "120,000"
  const hits = walk(src)
    .map((f) => relative(src, f).replaceAll("\\", "/"))
    .filter((f) => f !== "lib/prices.ts")
    .filter((f) => /\.(tsx?|css|txt|md)$/.test(f) && amounts.test(readFileSync(join(src, f), "utf8")));
  assert.deepEqual(hits, []);
});
