import Image from "next/image";
import { PriceBoard } from "@/components/PriceBoard";
import { WorkList } from "@/components/WorkList";
import { LeadForm } from "@/components/LeadForm";
import { BUILDER, SITE_NAME, primaryCta, whatsappHref } from "@/lib/site";

const STEPS = [
  ["You message", "WhatsApp or the form. A couple of lines about the business will do."],
  ["I quote", "A price and what it covers, before I open a laptop."],
  ["I build, in your accounts", "Domain, hosting and email are registered to you as we go."],
  ["You get the keys", "Every login, plus a walkthrough so you can change things yourself or hire someone else."],
];

const KEYS = [
  ["Domain", "Your name on the registrar. If we part ways, the address goes with you."],
  ["Hosting", "Your account, your card. I'm added as a helper."],
  ["Email", "Addresses like you@yourbusiness, in a mailbox you control."],
  ["Analytics", "Your visitor numbers live in your account, so you never wait on me for a report."],
  ["Code", "The files behind the site. Keep them, move them, or hand them to another developer."],
];

export default function Home() {
  const cta = primaryCta(true);
  const wa = whatsappHref();
  return (
    <>
      <section id="top" className="scene-sec" data-scene data-shift="0.27" data-side="left">
        <div className="panel panel-hero">
          <h1 className="h-hero hero-in">
            Who has the password to your website?
          </h1>
          <p className="lede hero-in d1" style={{ marginTop: "1.5rem" }}>
            If it&apos;s the person who built it, your website is really theirs. I build sites with
            the domain, hosting and every login in your name from day one. From LKR 35,000. Want
            replies and follow-ups handled at 11pm too? That&apos;s a monthly add-on.
          </p>
          <div className="hero-cta hero-in d2">
            <a className="pill" href={cta.href}>
              {cta.label}
            </a>
            <a className="pill pill-ghost" href="#prices">
              See the prices
            </a>
          </div>
        </div>
      </section>

      <section id="process" className="scene-sec" data-scene data-shift="0.17" data-side="right">
        <div className="panel">
          <h2 className="h-sec" data-split>
            Four steps. One person. No hand-offs.
          </h2>
          <ol className="rows" data-reveal="children">
            {STEPS.map(([h, p], i) => (
              <li key={h} className="row">
                <span className="n">0{i + 1}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="prices" className="scene-sec" data-scene data-shift="0.2" data-side="left">
        <div className="panel panel-dense">
          <h2 className="h-sec" data-split>
            Prices, before you ask.
          </h2>
          <p className="lede" data-reveal>
            No call needed to find out what this costs.
          </p>
          <PriceBoard />
        </div>
      </section>

      <section id="keys" className="scene-sec" data-scene data-shift="0.25" data-side="right">
        <div className="panel panel-bare">
          <h2 className="h-sec" data-split>
            Five keys. All of them yours.
          </h2>
          <p className="lede" data-reveal>
            Five accounts keep a website alive. If any one sits in someone else&apos;s name, so does
            your website.
          </p>
          <ul className="rows" data-reveal="children">
            {KEYS.map(([h, p]) => (
              <li key={h} className="row">
                <span className="n own" aria-hidden="true">
                  ◆
                </span>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="work" className="scene-sec" data-scene data-shift="0.085" data-side="left">
        <div className="panel">
          <h2 className="h-sec" data-split>
            Real sites. Click them.
          </h2>
          <p className="lede" data-reveal>
            Built before Loopstak existed, under my own name. They&apos;re live, so poke at them.
          </p>
          <div data-reveal="li">
            <WorkList />
          </div>
        </div>
      </section>

      <section id="contact" className="scene-sec" data-scene data-shift="0.22" data-side="right">
        <div className="panel">
          <h2 className="h-sec" data-split>
            Tell me what you sell.
          </h2>
          <p className="lede" data-reveal>
            {wa
              ? "WhatsApp is fastest. Two lines will do, and I read every message myself."
              : "Two lines will do. I read every message myself."}
          </p>
          {wa && (
            <div className="hero-cta">
              <a className="pill" href={wa}>
                Message me on WhatsApp
              </a>
            </div>
          )}
          <LeadForm whatsapp={wa} />
          <footer className="foot">
            <Image src="/brand/loopstak-white.png" alt={SITE_NAME} width={880} height={210} />
            <p>
              {SITE_NAME} is one person, {BUILDER}. Prices in LKR; USD is approximate.
            </p>
            <p style={{ marginTop: "0.4rem" }}>
              &copy; {new Date().getFullYear()} {SITE_NAME}
            </p>
          </footer>
        </div>
      </section>
    </>
  );
}
