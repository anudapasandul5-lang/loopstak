"use client";

import { useId, useState } from "react";
import { HOME } from "@/content/copy";
import { type LeadField, validateLead } from "@/lib/lead";
import { outcomeFromResponse, SEND_FAILED, thanksText } from "@/lib/lead-ui";
import { SERVICES, type ServiceId } from "@/lib/services";
import s from "./LeadForm.module.css";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; msg: string }
  | { kind: "unavailable"; msg: string }
  | { kind: "done"; text: string };

type Errors = Partial<Record<LeadField, string>>;

const ORDER: LeadField[] = ["name", "contact", "service", "message"];
// Known-good values, so each field can be checked on its own with the shared rules.
const GOOD = { name: "Ok", contact: "a@b.co", service: "", message: "Hello there" };

/** Run validateLead per field so every mistake shows at once, using the same rules as the server. */
function checkAll(data: Record<string, string>): Errors {
  const errors: Errors = {};
  for (const f of ORDER) {
    const r = validateLead({ ...GOOD, [f]: data[f] ?? "" });
    if (!r.ok && r.field === f) errors[f] = r.error;
  }
  return errors;
}

export function LeadForm({
  whatsapp,
  defaultService = "not-sure",
}: {
  whatsapp: string | null;
  defaultService?: ServiceId;
}) {
  const uid = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const id = (f: string) => `${uid}-${f}`;

  function focusField(form: HTMLFormElement, f: LeadField) {
    (form.elements.namedItem(f) as HTMLElement | null)?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const found = checkAll(data);
    setErrors(found);
    const first = ORDER.find((f) => found[f]);
    if (first) {
      setStatus({ kind: "idle" });
      focusField(form, first);
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = outcomeFromResponse(res.status, await res.json().catch(() => ({})));
      if (out.kind === "done") {
        form.reset();
        setStatus({ kind: "done", text: thanksText(data.name, data.contact) });
      } else if (out.kind === "field") {
        setErrors({ [out.field]: out.msg });
        setStatus({ kind: "idle" });
        focusField(form, out.field);
      } else {
        setStatus(out);
      }
    } catch {
      setStatus({ kind: "error", msg: SEND_FAILED });
    }
  }

  const done = status.kind === "done";
  const sending = status.kind === "sending";
  const a11y = (f: LeadField) =>
    errors[f] ? { "aria-invalid": true as const, "aria-describedby": id(`${f}-err`) } : {};
  const err = (f: LeadField) =>
    errors[f] ? (
      <span id={id(`${f}-err`)} className={s.err}>
        {errors[f]}
      </span>
    ) : null;

  return (
    <div className={s.wrap}>
      <p className={s.note}>{HOME.contact.formNote}</p>

      <div role="status" aria-live="polite" className={done ? s.done : undefined}>
        {done && <p>{status.text}</p>}
      </div>

      {!done && (
        <form className={s.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
          <div className={s.field}>
            <label htmlFor={id("name")}>Name</label>
            <input id={id("name")} name="name" autoComplete="name" required {...a11y("name")} />
            {err("name")}
          </div>
          <div className={s.field}>
            <label htmlFor={id("contact")}>WhatsApp number or email</label>
            <input
              id={id("contact")}
              name="contact"
              autoComplete="email"
              spellCheck={false}
              required
              {...a11y("contact")}
            />
            {err("contact")}
          </div>
          <div className={s.field}>
            <label htmlFor={id("service")}>Which service</label>
            <select id={id("service")} name="service" defaultValue={defaultService} {...a11y("service")}>
              {SERVICES.map((sv) => (
                <option key={sv.id} value={sv.id}>
                  {sv.name}
                </option>
              ))}
            </select>
            {err("service")}
          </div>
          <div className={s.field}>
            <label htmlFor={id("message")}>Message</label>
            <textarea id={id("message")} name="message" rows={5} required {...a11y("message")} />
            {err("message")}
          </div>

          <div className={s.hp} aria-hidden="true">
            <label htmlFor={id("hp")}>Website</label>
            <input id={id("hp")} name="hp_url" tabIndex={-1} autoComplete="off" />
          </div>

          <button className={s.send} type="submit" disabled={sending}>
            {sending ? "SENDING…" : "SEND →"}
          </button>

          <div className={s.status} role="alert">
            {status.kind === "error" && <p className={s.err}>{status.msg}</p>}
            {status.kind === "unavailable" && (
              <>
                <p className={s.err}>{status.msg}</p>
                {whatsapp && (
                  <a className={s.wa} href={whatsapp}>
                    {HOME.contact.whatsappCta}
                  </a>
                )}
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
