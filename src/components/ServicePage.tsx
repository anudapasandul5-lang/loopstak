import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Price, PriceNote } from "@/components/Price";
import { ListToggle } from "@/components/ListToggle";
import { Contact } from "@/components/Contact";
import { Cta } from "@/components/Cta";
import { SERVICES, serviceById, type ServiceId } from "@/lib/services";
import { IDEA_CALL_LABEL, WORK, ideaCallHref } from "@/lib/site";

export function serviceMetadata(id: ServiceId): Metadata {
  const s = serviceById(id);
  return {
    title: s.page.title,
    description: s.page.description,
    alternates: { canonical: `/${s.slug}` },
    openGraph: { title: s.page.title, description: s.page.description, type: "website" },
  };
}

/**
 * One template, four scroll stories: the page's shape builds in four stages as you read
 * (hero, who it's for, what's included, price), then steps back for proof and contact.
 */
export function ServicePage({ id }: { id: ServiceId }) {
  const s = serviceById(id);
  const p = s.page;
  const call = ideaCallHref();
  const stage = (n: 1 | 2 | 3 | 4) => (
    <p className="stage-cap" data-reveal>
      <b aria-hidden="true">{n}</b>
      {p.stages[n - 1]}
    </p>
  );

  return (
    <>
      <section id="top" className="scene hero svc-hero" data-form={`${s.form}:1`} data-side="left">
        <div className="wrap hero-in">
          <Link className="back" href="/#services">
            <b>{s.n}</b> {s.name}
          </Link>
          <h1 className="h-hero">
            <span className="line">
              <span>{p.h1}</span>
            </span>
          </h1>
          <p className="lede lede-hero hero-rise">{p.sub}</p>
          <div className="cta-row hero-rise d2">
            <Cta href={call} size="lg" magnetic>
              {IDEA_CALL_LABEL}
            </Cta>
            <Cta href="#price" kind="ghost" size="lg">
              See the price
            </Cta>
          </div>
        </div>
      </section>

      <section className="scene" data-form={`${s.form}:2`} data-side="right">
        <div className="wrap">
          <div className="side-copy right">
            {stage(2)}
            <h2 className="h-sec" data-split>
              Who it’s for.
            </h2>
            <p className="lede" data-reveal>
              {p.forWho}
            </p>
          </div>
        </div>
      </section>

      <section className="scene" data-form={`${s.form}:3`} data-side="left">
        <div className="wrap">
          <div className="side-copy">
            {stage(3)}
            <h2 className="h-sec" data-split>
              What’s included.
            </h2>
            <ul className="included" data-reveal>
              {p.included.map((x) => (
                <li key={x} data-glow>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="price" className="scene" data-form={`${s.form}:4`} data-side="right">
        <div className="wrap">
          <div className="side-copy right">
            {stage(4)}
            <h2 className="h-sec" data-split>
              The price, in writing.
            </h2>
            <div className="svc-price" data-reveal data-glow>
              <Price id={s.id} />
              <p className="tp-note">
                <PriceNote id={s.id} />
              </p>
              <h3 className="tp-h svc-not">Not included</h3>
              <ul className="dashes">
                {p.notIncluded.map((x) => (
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
              <ListToggle />
            </div>
          </div>
        </div>
      </section>

      <section className="scene" data-form="drift" data-side="center">
        <div className="wrap">
          <h2 className="h-sec" data-split>
            {s.id === "website" ? "Real sites. Open them." : "Proof, honestly."}
          </h2>
          <p className="lede" data-reveal>
            {p.proof}
          </p>
          {s.id === "website" && (
            <ul className="svc-proof" data-reveal>
              {WORK.filter((w) => w.kind === "Client").map((w) => (
                <li key={w.name}>
                  <a href={w.href} target="_blank" rel="noopener">
                    <Image src={w.src} alt={`The ${w.name} website`} width={1440} height={900} sizes="(min-width: 900px) 30vw, 92vw" />
                    <span>
                      {w.host} <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <nav className="others" aria-label="Other Services" data-reveal>
            {SERVICES.filter((o) => o.id !== s.id).map((o) => (
              <Link key={o.id} className="chip" href={`/${o.slug}`}>
                {o.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <Contact title="Start with a free Idea call." line={p.contactLine} service={s.name} faq={p.faq} />
    </>
  );
}
