import Link from "next/link";
import Image from "next/image";
import { Ticker } from "@/components/Ticker";
import { Price, PriceNote } from "@/components/Price";
import { PriceTabs } from "@/components/PriceTabs";
import { ListToggle } from "@/components/ListToggle";
import { Contact } from "@/components/Contact";
import { Cta } from "@/components/Cta";
import { SERVICES } from "@/lib/services";
import { BUILDER, IDEA_CALL_LABEL, WORK, ideaCallHref } from "@/lib/site";

const STEPS = [
  ["Talk", "A free 30-minute Idea call. We name three tasks a better website or AI could take over, with a rough price for each."],
  ["Fixed price, in writing", "You see what you get and what it costs before any work starts."],
  ["We build or teach", "Your site, tool or setup gets built, or your session gets run. A website goes live 7 days after you send photos and text."],
  ["You get the keys", "Every account, domain and login is in your name."],
] as const;

const KEYS = [
  ["Your web address", "Registered to you. It stays yours if we stop working together."],
  ["Hosting", "Your account, your card. We are added as a helper."],
  ["Google listing", "Your Google Business Profile and Search Console, owned by you."],
  ["AI accounts", "Automations and Claude run in your own accounts, on your own plan."],
  ["The files", "Yours to keep, move, or hand to another developer."],
] as const;

const FAQ: [string, string][] = [
  ["What is the Idea call?", "A free 30-minute call. We name three tasks a better website or AI could take over, with a rough price for each."],
  ["How long does a website take?", "It goes live 7 days after you send your photos and text."],
  ["Who owns the website and the accounts?", "You do, from day one. Domain, hosting and every login are in your name."],
  ["Is Loopstak a big team?", `No. ${BUILDER} builds every project.`],
  ["Why are there two price lists?", "Rupee prices are for clients in Sri Lanka. Dollar prices are for clients outside Sri Lanka."],
];

export default function Home() {
  const call = ideaCallHref();

  const panels = Object.fromEntries(
    SERVICES.map((s) => [
      s.id,
      <div key={s.id} className="tp">
        <div className="tp-price">
          <Price id={s.id} />
          <p className="tp-note">
            <PriceNote id={s.id} />
          </p>
        </div>
        <div className="tp-lists">
          <div>
            <h3 className="tp-h">Included</h3>
            <ul className="ticks">
              {s.page.included.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="tp-h">Not included</h3>
            <ul className="dashes">
              {s.page.notIncluded.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {s.id === "website" && (
              <div className="addon">
                <h3 className="tp-h">Upkeep, optional</h3>
                <p>
                  <Price id="upkeep" />
                </p>
                <p>Keeps your site updated and running. New prices, new photos, a broken link: send a message and it is handled.</p>
              </div>
            )}
          </div>
        </div>
      </div>,
    ]),
  ) as Record<(typeof SERVICES)[number]["id"], React.ReactNode>;

  return (
    <>
      {/* hero: copy left, the loop assembles on the right */}
      <section id="top" className="scene hero" data-form="loop" data-side="left">
        <div className="wrap hero-in">
          <h1 className="h-hero">
            <span className="line">
              <span>The website and</span>
            </span>
            <span className="line">
              <span>the AI behind it.</span>
            </span>
          </h1>
          <p className="lede lede-hero hero-rise">
            Built for you, <em className="mint">owned by you.</em> For owner-run businesses in Sri Lanka and abroad, at fixed public prices.
          </p>
          <div className="cta-row hero-rise d2">
            <Cta href={call} size="lg" magnetic>
              {IDEA_CALL_LABEL}
            </Cta>
            <Cta href="/#prices" kind="ghost" size="lg">
              See prices
            </Cta>
          </div>
        </div>
        <Ticker />
      </section>

      {/* statement: the reason the four Services belong together */}
      <section id="why" className="scene statement" data-form="city" data-side="center" data-dim="0.5">
        <div className="wrap">
          <p className="statement-text" data-scrub>
            Owner-run businesses deserve the websites and AI that big companies have. Without the big-company bill, and
            without the lock-in.
          </p>
        </div>
      </section>

      {/* four Services: one chapter each, the blocks rebuild into each one */}
      <div id="services">
        {SERVICES.map((s, i) => (
          <section key={s.id} className="scene chapter" data-form={s.form} data-side="left" aria-labelledby={`svc-${s.id}`}>
            <div className="wrap">
              <div className="chapter-copy">
                {i === 0 && (
                  <h2 className="label" data-reveal>
                    Four things we build
                  </h2>
                )}
                <p className="chapter-n" aria-hidden="true">
                  {s.n}
                </p>
                <h3 id={`svc-${s.id}`} className="h-chapter" data-split>
                  {s.name}
                </h3>
                <p className="lede" data-reveal>
                  {s.line}
                </p>
                <ul className="points" data-reveal>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div className="chapter-foot" data-reveal>
                  <p className="chapter-price">
                    <Price id={s.id} />
                  </p>
                  <Link className="arrow-link" href={`/${s.slug}`}>
                    {s.name} page <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* work: live sites, panned sideways on desktop. The wrapper stays React's: ScrollTrigger's pin
          puts its own spacer around the section, and React must never be asked to remove that. */}
      <div className="pin-host">
        <section id="work" className="scene work" data-form="drift" data-side="center" data-pan>
          <div className="work-track" data-pan-track>
            <div className="work-intro">
              <h2 className="h-sec" data-split>
                Real sites. Open them.
              </h2>
              <p className="lede" data-reveal>
                Three for clients and two of our founder’s own ventures, all built before Loopstak had a name. All five are live.
              </p>
            </div>
            {WORK.map((w, i) => (
              <article key={w.name} className="work-card">
                <a href={w.href} target="_blank" rel="noopener" className="work-link">
                  <span className="work-shot">
                    <Image src={w.src} alt={`The ${w.name} website`} width={1440} height={900} sizes="(min-width: 900px) 56vw, 92vw" data-drift />
                  </span>
                  <span className="work-meta">
                    <span className="work-i" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="work-name" translate="no">
                      {w.name}
                    </span>
                    <span className="work-kind">{w.kind}</span>
                  </span>
                  <span className="work-note">{w.note}</span>
                  <span className="work-host">
                    {w.host} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* process: the stack builds one layer per step */}
      <section id="process" className="scene" data-form="stack" data-side="right">
        <div className="wrap">
          <div className="side-copy right">
            <h2 className="h-sec" data-split>
              How it works.
            </h2>
            <ol className="steps" data-reveal>
              {STEPS.map(([h, p], i) => (
                <li key={h}>
                  <span className="step-n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* prices: calm, no shape in front of the numbers */}
      <section id="prices" className="scene prices" data-form="drift" data-side="center">
        <div className="wrap">
          <div className="prices-head">
            <h2 className="h-sec" data-split>
              Prices, before you ask.
            </h2>
            <p className="lede" data-reveal>
              Pick a Service to see what it costs and what is in it.
            </p>
            <ListToggle />
          </div>
          <div className="prices-board" data-reveal data-glow>
            <PriceTabs panels={panels} />
          </div>
        </div>
      </section>

      {/* keys: the promise, and the key turns mint as you scroll */}
      <section id="keys" className="scene" data-form="key" data-side="left">
        <div className="wrap">
          <div className="side-copy">
            <h2 className="h-sec" data-split>
              Every key is <em className="mint">in your name.</em>
            </h2>
            <p className="lede" data-reveal>
              Your domain, hosting, accounts and logins are set up in your name from day one. If we stop working together, you
              keep all of it.
            </p>
            <ul className="keys" data-reveal>
              {KEYS.map(([h, p]) => (
                <li key={h} data-glow>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* who builds it: honest about size */}
      <section id="who" className="scene" data-form="person" data-side="right">
        <div className="wrap">
          <div className="side-copy right">
            <h2 className="h-sec" data-split>
              One person builds every project.
            </h2>
            <p className="lede" data-reveal>
              {BUILDER} builds every Loopstak project. We say “we” because Loopstak is a studio. It is not a big team. You deal
              with the person who does the work.
            </p>
          </div>
        </div>
      </section>

      <Contact faq={FAQ} />
    </>
  );
}
