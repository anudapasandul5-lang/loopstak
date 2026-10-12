import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, type ServiceSlug } from "@/content/copy";
import { ServicePage } from "@/components/service/ServicePage";
import type { ServiceStoryDef } from "@/components/service/ServiceStory";
import { AgentGears, ClaudePlug, TeachingTable, WebsiteBuild } from "@/components/clay/lazy-scenes";
import { visitorCountry } from "@/lib/visitor-country";

// Only the four Service slugs exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

// Scroll story per Service. A Service without one simply has no story section.
const STORIES: Partial<Record<ServiceSlug, ServiceStoryDef>> = {
  "website-design": {
    Scene: WebsiteBuild,
    still: "/stills/site.webp",
    label: "A clay web page built part by part: base, browser bar, title, picture and cards, with the button in mint.",
  },
  "ai-agents-automation": {
    Scene: AgentGears,
    still: "/stills/gears.webp",
    heading: "A message, answered →",
    label: "Clay gears turning between a cream message bubble and a mint reply bubble: a message goes in, an answer comes out.",
  },
  "claude-integration": {
    Scene: ClaudePlug,
    still: "/stills/plug-lit.webp",
    heading: "Plugged into your tools →",
    label: "Two clay blocks joined by a clay plug. Once the plug is in, both blocks turn mint.",
  },
  "ai-teaching": {
    Scene: TeachingTable,
    still: "/stills/table.webp",
    label: "A clay table with a board and eight plain figures taking their seats one by one.",
    heading: "Seat by seat →",
  },
};

const find = (slug: string) => SERVICES.find((s) => s.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const s = find(service);
  if (!s) return {};
  return {
    title: s.page.title,
    description: s.page.description,
    alternates: { canonical: `/${s.slug}` },
    openGraph: { title: s.page.title, description: s.page.description, url: `/${s.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const s = find(service);
  if (!s) notFound();
  const country = await visitorCountry();
  return <ServicePage service={s} story={STORIES[s.slug]} country={country} />;
}
