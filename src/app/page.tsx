import Link from "next/link";
import Image from "next/image";
import { Prices } from "@/components/sections/Prices";
import { WorkList } from "@/components/WorkList";
import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/sections/Ticker";
import { Statement } from "@/components/sections/Statement";
import { Services } from "@/components/sections/Services";
import { LeadForm } from "@/components/LeadForm";
import { visitorCountry } from "@/lib/visitor-country";
import { PRICES, formatPrice } from "@/lib/prices";
import { BUILDER, SITE_NAME, freeCheckHref, whatsappHref } from "@/lib/site";

const STEPS = [
  ["You message us", "WhatsApp or the form. Two lines about what you sell will do."],
  ["We quote", "A fixed price and exactly what it covers, before any work starts."],
  ["You send photos and text, we build", "Your site is live 7 days later, set up in your name as we go."],
  ["You approve, then pay the rest", "Every login is yours, plus a walkthrough so you can change things yourself."],
];

const STATS = [
  ["7 days", "from your photos to a live site"],
  [formatPrice(PRICES.LKR["website-design"]), "one price, published up front"],
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

export default async function Home() {
  const country = await visitorCountry();
  const wa = whatsappHref();
  const check = freeCheckHref();
  return (
    <>
      <Hero />
      <Ticker />
      <Statement />
      <Services />

      <section id="process" className="scene-sec" data-side="right">
        <div className="panel">
          <h2 className="h-sec" data-split>
            Four steps. One person. No hand-offs.
          </h2>
          <p className="lede" data-reveal>
            Your regulars know your Instagram. New customers search Google first. This is how you end up there.
          </p>
          <ol className="rows" data-reveal="children">
            {STEPS.map(([h, p], i) => (
              <li key={h} className="row">
                <span className="n">0{i + 1}</span>
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

      <Prices country={country} />

      <section id="keys" className="scene-sec" data-side="right">
        <div className="panel panel-bare">
          <Image
            className="own-switch"
            src="/brand/own-switch.jpg"
            alt=""
            width={1024}
            height={768}
          />
          <h2 className="h-sec" data-split>
            From a rented page to a site you own.
          </h2>
          <p className="lede" data-reveal>
            Instagram can lock your account. Plenty of builders keep the logins, which means they keep
            your website. We set all five keys up in your name from the first day.
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

      <section id="work" className="scene-sec" data-side="left">
        <div className="panel">
          <h2 className="h-sec" data-split>
            Real sites. Click them.
          </h2>
          <p className="lede" data-reveal>
            Three for clients, two of our founder’s own ventures, all built before Loopstak had a name. They’re live, so
            try them.
          </p>
          <div data-reveal="li">
            <WorkList />
          </div>
        </div>
      </section>

      <section id="contact" className="scene-sec" data-side="right">
        <div className="panel">
          <h2 className="h-sec" data-split>
            Tell us what you sell.
          </h2>
          <p className="lede" data-reveal>
            {wa
              ? "WhatsApp is fastest. Two lines will do, and a real person reads every message."
              : "Two lines will do, and a real person reads every message."}
          </p>
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
              Send us your business name. We’ll tell you what Google shows and what’s missing. No
              pitch unless you ask.
            </span>
          </a>
          <LeadForm whatsapp={wa} />
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <footer className="foot">
            <Image src="/brand/loopstak-white.png" alt={SITE_NAME} width={880} height={210} />
            <p>
              <span translate="no">{SITE_NAME}</span> is built and run by {BUILDER}.
            </p>
            <p className="copy">
              <span translate="no">{SITE_NAME}</span> · <Link href="/privacy">How we handle your details</Link>
            </p>
          </footer>
        </div>
      </section>
    </>
  );
}
