import type { MetadataRoute } from "next";
import { SECTIONS } from "../lib/sections";
import { REGIONS } from "../lib/regions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.worrry.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const sectionRoutes: MetadataRoute.Sitemap = SECTIONS.map((s) => ({
    url: `${SITE_URL}/section/${s.slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  const regionRoutes: MetadataRoute.Sitemap = REGIONS.map((r) => ({
    url: `${SITE_URL}/region/${r.slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...sectionRoutes, ...regionRoutes];
}
