import type { MetadataRoute } from "next";
import { SERVICES } from "@/content/copy";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Home plus every Service page. Slugs come from copy.ts so this list cannot drift from the routes.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL("/", siteUrl).toString() },
    ...SERVICES.map((s) => ({ url: new URL(`/${s.slug}`, siteUrl).toString() })),
  ];
}
