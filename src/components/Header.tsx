import Image from "next/image";
import { SITE_NAME, primaryCta } from "@/lib/site";

export function Header() {
  const cta = primaryCta();
  return (
    <header className="topbar">
      <div className="topbar-in">
        <a href="#top" className="mark" aria-label={`${SITE_NAME}, back to top`}>
          <Image src="/brand/loopstak-white.png" alt="" width={880} height={210} priority />
        </a>
        <nav aria-label="Primary">
          <a href="#process">Steps</a>
          <a href="#prices">Prices</a>
          <a href="#keys">Keys</a>
          <a href="#work">Work</a>
          <a className="pill" href={cta.href}>
            {cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
