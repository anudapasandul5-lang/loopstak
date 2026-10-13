import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: `${base}/`, priority: 1 },
    ...SERVICES.map((s) => ({ url: `${base}/${s.slug}`, priority: 0.8 })),
    { url: `${base}/privacy`, priority: 0.2 },
  ];
}
