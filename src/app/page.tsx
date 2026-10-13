import Link from "next/link";
import Image from "next/image";
import { PriceBoard } from "@/components/PriceBoard";
import { WorkList } from "@/components/WorkList";
import { HeroWindow } from "@/components/HeroWindow";
import { LeadForm } from "@/components/LeadForm";
import { BUILDER, SITE_NAME, WORK, freeCheckHref, primaryCta, whatsappHref } from "@/lib/site";

const STEPS = [
  ["You message us", "WhatsApp or the form. Two lines about what you sell will do."],
  ["We quote", "A fixed price and exactly what it covers, before any work starts."],
  ["You send photos and text, we build", "Your site is live 7 days later, set up in your name as we go."],
  ["You approve, then pay the rest", "Every login is yours, plus a walkthrough so you can change things yourself."],
];

const STATS = [
  ["7 days", "from your photos to a live site"],
  ["LKR 35k", "one price, published up front"],
  ["5 keys", "all registered in your name"],
  ["50%", "paid only after you approve"],
];

const KEYS = [
  ["Your web address", "Registered to you. If we stop working together, it stays yours."],
  ["Hosting", "Your account, your card. We’re added as a helper."],
  ["Google listing", "Your Google Business Profile and Search Console, owned by you."],
  ["Email", "Addresses like you@yourbusiness, in a mailbox you control."],
  ["The site’s files", "Yours to keep, move, or hand to another developer."],
];

const FAQ = [
  ["How long does it take?", "7 days from the day you send your photos and text."],
  ["What do I need to send?", "Your logo if you have one, photos, your prices or services, and contact details."],
  ["Will I rank first on Google?", "Nobody can honestly promise that. We make sure Google can find you when people search your name."],
  ["Do I need a .lk address?", "No. A .lk costs more each year than a .com, so we’ll help you choose."],
  ["Can I edit it myself?", "Small changes, yes: you get a walkthrough. For anything bigger there’s Upkeep."],
];

export default function Home() {
  const cta = primaryCta(true);
  const wa = whatsappHref();
  const check = freeCheckHref();
  return (
    <>
      <section id="top" className="sec hero">
        <div className="sec-in">
          <ul className="svc hero-in" aria-label="Services">
            <li className="on">Website</li>
            <li>Upkeep</li>
            <li>Automations</li>
          </ul>
          <p className="eyebrow hero-in" translate="no">
            Loopstak
          </p>
          <h1 className="h-hero hero-in">
            <span className="hl">We build websites</span>{" "}
            <span className="hl">that help you</span>{" "}
            <span className="hl">
              <span className="hl-gap" aria-hidden="true" /> <em>get customers.</em>
            </span>
          </h1>
          <HeroWindow />
          <div className="hero-foot">
            <p className="lede lede-hero hero-in d1">
              For Sri Lankan businesses. On Google, live in 7 days, from LKR 35,000, and yours to keep.
            </p>
            <div className="hero-cta hero-in d2">
              <a className="pill" href={cta.href}>
                {cta.label}
              </a>
              <a className="pill pill-ghost" href={check}>
                Free Google check
              </a>
            </div>
          </div>
          <p className="built hero-in d2">
            Live sites we’ve built: <span translate="no">{WORK.map((w) => w.name).join(" · ")}</span>
          </p>
        </div>
      </section>

      <section id="process" className="sec">
        <div className="sec-in">
          <header className="sec-head">
            <p className="kicker">How it works</p>
            <h2 className="h-sec" data-split>
              Four steps. One person. No hand-offs.
            </h2>
            <p className="lede" data-reveal>
              Your regulars know your Instagram. New customers search Google first. This is how you end up there.
            </p>
          </header>
          <ol className="steps" data-reveal="children">
            {STEPS.map(([h, p], i) => (
              <li key={h} className="step">
                <span className="n">{i + 1}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
          <dl className="stats" data-reveal="children">
            {STATS.map(([n, l]) => (
              <div key={n}>
                <dt>{n}</dt>
                <dd>{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="prices" className="sec sec-alt">
        <div className="sec-in">
          <header className="sec-head">
            <p className="kicker">Prices</p>
            <h2 className="h-sec" data-split>
              Prices, before you ask.
            </h2>
            <p className="lede" data-reveal>
              No call needed to find out what this costs.
            </p>
          </header>
          <div className="prices-body">
            <PriceBoard />
            <p className="fine">
              Not ready yet? <a href={check}>Send us your business name</a> and we’ll tell you what Google shows
              for it, free.
            </p>
          </div>
        </div>
      </section>

      <section id="keys" className="sec">
        <div className="sec-in">
          <header className="sec-head">
            <p className="kicker">What you own</p>
            <h2 className="h-sec" data-split>
              From a rented page to a site you own.
            </h2>
            <p className="lede" data-reveal>
              Instagram can lock your account. Plenty of builders keep the logins, which means they keep your
              website. We set all five keys up in your name from the first day.
            </p>
          </header>
          <ul className="keys" data-reveal="children">
            {KEYS.map(([h, p]) => (
              <li key={h} className="key">
                <h3>{h}</h3>
                <p>{p}</p>
                <span className="key-stamp">Yours</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="work" className="sec">
        <div className="sec-in">
          <header className="sec-head">
            <p className="kicker">Work</p>
            <h2 className="h-sec" data-split>
              Real sites. Click them.
            </h2>
            <p className="lede" data-reveal>
              Three for clients, two of our founder’s own ventures, all built before Loopstak had a name. They’re
              live, so try them.
            </p>
          </header>
          <WorkList />
        </div>
      </section>

      <section id="contact" className="sec sec-alt">
        <div className="sec-in contact">
          <div className="contact-main">
            <header className="sec-head">
              <p className="kicker">Contact</p>
              <h2 className="h-sec" data-split>
                Tell us what you sell.
              </h2>
              <p className="lede" data-reveal>
                {wa
                  ? "WhatsApp is fastest. Two lines will do, and a real person reads every message."
                  : "Two lines will do, and a real person reads every message."}
              </p>
            </header>
            {wa && (
              <div className="hero-cta">
                <a className="pill" href={wa}>
                  Message us on WhatsApp
                </a>
              </div>
            )}
            <a className="free-check" href={check}>
              <strong>Not ready? Free Google check.</strong>
              <span>
                Send us your business name. We’ll tell you what Google shows and what’s missing. No pitch unless you
                ask.
              </span>
            </a>
            <div className="faq">
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="contact-form">
            <LeadForm whatsapp={wa} />
          </div>
        </div>
        <footer className="foot sec-in">
          <Image src="/brand/loopstak-ink.png" alt={SITE_NAME} width={880} height={210} />
          <p>
            <span translate="no">{SITE_NAME}</span> is built and run by {BUILDER}. Prices in LKR; USD is approximate.
          </p>
          <p className="copy">
            <span translate="no">{SITE_NAME}</span> · <Link href="/privacy">How we handle your details</Link>
          </p>
        </footer>
      </section>
    </>
  );
}
