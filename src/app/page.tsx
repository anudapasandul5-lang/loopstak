import { Prices } from "@/components/sections/Prices";
import { WorkList } from "@/components/WorkList";
import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/sections/Ticker";
import { Statement } from "@/components/sections/Statement";
import { Process } from "@/components/sections/Process";
import { Keys } from "@/components/sections/Keys";
import { Contact } from "@/components/sections/Contact";
import { visitorCountry } from "@/lib/visitor-country";

export default async function Home() {
  const country = await visitorCountry();
  return (
    <>
      <Hero />
      <Ticker />
      <Statement />

      <Process />

      <Prices country={country} />

      <Keys />

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

      {/* #12 inserts "Who builds it" here, right before Contact */}

      <Contact />
    </>
  );
}
