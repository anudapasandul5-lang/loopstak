import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/sections/Ticker";
import { Statement } from "@/components/sections/Statement";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { Process } from "@/components/sections/Process";
import { Prices } from "@/components/sections/Prices";
import { Keys } from "@/components/sections/Keys";
import { WhoBuilds } from "@/components/sections/WhoBuilds";
import { Contact } from "@/components/sections/Contact";
import { visitorCountry } from "@/lib/visitor-country";

// Home only: Service pages set their own canonical; privacy and 404 should not inherit "/".
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const country = await visitorCountry();
  return (
    <>
      <Hero />
      <Ticker />
      <Statement />
      <Services />
      <Work />
      <CaseStudy />
      <Process />
      <Prices country={country} />
      <Keys />
      <WhoBuilds />
      <Contact />
    </>
  );
}
