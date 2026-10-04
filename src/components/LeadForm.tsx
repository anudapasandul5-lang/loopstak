"use client";

import { useState } from "react";
import { NEEDS } from "@/lib/lead";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "error"; msg: string } | { kind: "done" };

export function LeadForm({ whatsapp }: { whatsapp: string | null }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      form.reset();
      setState({ kind: "done" });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  if (state.kind === "done") {
    return (
      <div className="form form-done" role="status">
        <h3 style={{ fontSize: "1.6rem" }}>Got it.</h3>
        <p>I&apos;ll reply to the number or email you gave.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <label>
        Your name
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        WhatsApp number or email
        <input name="contact" autoComplete="off" required />
      </label>
      <label>
        What do you need?
        <select name="need" defaultValue={NEEDS[0]}>
          {NEEDS.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label>
        What does the business sell?
        <textarea name="message" required />
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
        className={`form-status ${state.kind === "error" ? "err" : ""}`}
        role={state.kind === "error" ? "alert" : "status"}
      >
        {state.kind === "error" && (
          <>
            {state.msg}{" "}
            {whatsapp && (
              <a href={whatsapp} style={{ color: "inherit" }}>
                Message on WhatsApp instead.
              </a>
            )}
          </>
        )}
      </p>
    </form>
  );
}
