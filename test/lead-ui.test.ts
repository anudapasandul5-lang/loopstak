import test from "node:test";
import assert from "node:assert/strict";
import { outcomeFromResponse, thanksText } from "../src/lib/lead-ui.ts";

test("maps each server response to a UI outcome", () => {
  assert.equal(outcomeFromResponse(200, { ok: true }).kind, "done");
  assert.deepEqual(outcomeFromResponse(422, { error: "Add your name", field: "name" }), {
    kind: "field",
    field: "name",
    msg: "Add your name",
  });
  assert.equal(outcomeFromResponse(503, { error: "x", unavailable: true }).kind, "unavailable");
  assert.equal(outcomeFromResponse(429, { error: "Too many" }).kind, "error");
  assert.equal(outcomeFromResponse(502, { error: "Later" }).kind, "error");
  assert.equal(outcomeFromResponse(500, null).kind, "error");
  assert.equal(outcomeFromResponse(422, { error: "x", field: "bogus" }).kind, "error");
});

test("thank-you mentions the inbox only for an email contact", () => {
  assert.match(thanksText("Nimal", "n@x.lk"), /inbox/);
  assert.doesNotMatch(thanksText("Nimal", "0771234567"), /inbox/);
});
