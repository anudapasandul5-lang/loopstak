"use client";

import { useState } from "react";
import { type LeadField, validateLead } from "@/lib/lead";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; msg: string; field?: LeadField }
  | { kind: "done" };

const FAILED = "Couldn’t send that. Check your connection and try again.";

export function LeadForm({ whatsapp }: { whatsapp: string | null }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // Same rules as the server, checked first so mistakes show beside the field without a round trip.
    const check = validateLead(data);
    if (!check.ok && check.error !== "rejected") {
      setState({ kind: "error", msg: check.error, field: check.field });
      if (check.field) (form.elements.namedItem(check.field) as HTMLElement | null)?.focus();
      return;
    }

    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? FAILED);
      form.reset();
      setState({ kind: "done" });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error && err.message ? err.message : FAILED });
    }
  }

  if (state.kind === "done") {
    return (
      <div className="form form-done" role="status">
        <h3>Got it.</h3>
        <p>We’ll reply to the number or email you gave.</p>
      </div>
    );
  }

  const fieldErr = state.kind === "error" ? state.field : undefined;
  const errFor = (f: LeadField) =>
    fieldErr === f && state.kind === "error" ? (
      <span id={`${f}-err`} className="field-err">
        {state.msg}
      </span>
    ) : null;
  const a11y = (f: LeadField) =>
    fieldErr === f ? { "aria-invalid": true, "aria-describedby": `${f}-err` } : {};

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <label>
        Your name
        <input name="name" autoComplete="name" required {...a11y("name")} />
        {errFor("name")}
      </label>
      <label>
        WhatsApp number or email
        <input
          name="contact"
          autoComplete="off"
          spellCheck={false}
          placeholder="0771234567 or you@shop.lk…"
          required
          {...a11y("contact")}
        />
        {errFor("contact")}
      </label>
      <label>
        What does the business sell?
        <textarea name="message" required {...a11y("message")} />
        {errFor("message")}
      </label>
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input name="hp_url" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="pill" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send it"}
      </button>
      <p
        className={`form-status ${state.kind === "error" && !fieldErr ? "err" : ""}`}
        role={state.kind === "error" && !fieldErr ? "alert" : "status"}
        aria-live="polite"
      >
        {state.kind === "error" && !fieldErr && (
          <>
            {state.msg}{" "}
            {whatsapp && <a href={whatsapp}>Message us on WhatsApp instead.</a>}
          </>
        )}
      </p>
    </form>
  );
}
