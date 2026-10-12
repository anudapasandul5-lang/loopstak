import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, type ServiceSlug } from "@/content/copy";
import { ServicePage } from "@/components/service/ServicePage";
import type { ServiceStoryDef } from "@/components/service/ServiceStory";
import { WebsiteBuild } from "@/components/clay/scenes/WebsiteBuild";
import { AgentGears } from "@/components/clay/scenes/AgentGears";
import { ClaudePlug } from "@/components/clay/scenes/ClaudePlug";
import { visitorCountry } from "@/lib/visitor-country";

// Only the four Service slugs exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

// Scroll stories per Service. The others get theirs in later tickets; until then the page has no story section.
const STORIES: Partial<Record<ServiceSlug, ServiceStoryDef>> = {
  "website-design": {
    Scene: WebsiteBuild,
    still: "/stills/svc-website-build.png",
    label: "A clay website built from slabs: base, header, image, text and button, with the web address on top in mint.",
  },
  "ai-agents-automation": {
    Scene: AgentGears,
    still: "/stills/svc-agents-gears.png",
    heading: "A message, answered →",
    label: "A ring of soft clay gears. A message passes through them and comes out as an answer, in mint.",
  },
  "claude-integration": {
    Scene: ClaudePlug,
    still: "/stills/svc-claude-plug.png",
    heading: "Plugged into your tools →",
    label: "Two clay blocks joined by a clay plug on a soft cable. Once the plug is in, both blocks turn mint.",
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
