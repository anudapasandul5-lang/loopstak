import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/lib/services";
import { BUILDER, SITE_NAME, whatsappHref } from "@/lib/site";
import { LIST_NOTE } from "@/lib/prices";

export function Footer() {
  const wa = whatsappHref();
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <div className="foot-cols">
          <nav aria-label="Services">
            <h2 className="foot-h">Services</h2>
            <ul>
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <Link href={`/${s.slug}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Studio">
            <h2 className="foot-h">Studio</h2>
            <ul>
              <li>
                <Link href="/#work">Work</Link>
              </li>
              <li>
                <Link href="/#prices">Prices</Link>
              </li>
              <li>
                <Link href="/#who">Who builds it</Link>
              </li>
              <li>
                <Link href="/privacy">How we handle your details</Link>
              </li>
            </ul>
          </nav>
          <div>
            <h2 className="foot-h">Talk to us</h2>
            <ul>
              {wa && (
                <li>
                  <a href={wa}>WhatsApp</a>
                </li>
              )}
              <li>
                <Link href="/#contact">Enquiry form</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="foot-note">
          <span translate="no">{SITE_NAME}</span> is built and run by {BUILDER}, in Colombo. {LIST_NOTE}
        </p>
        <Image className="foot-mark" src="/brand/loopstak-white.png" alt={SITE_NAME} width={880} height={210} data-reveal />
      </div>
    </footer>
  );
}
