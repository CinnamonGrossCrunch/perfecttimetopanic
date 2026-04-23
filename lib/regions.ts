// Classifier geography tag → URL slug + display label. Drives the globe-icon dropdown
// and the /region/<slug> sub-page route.

export type RegionConfig = {
  slug: string;
  label: string;
};

export const REGIONS: RegionConfig[] = [
  { slug: "north-america", label: "North America" },
  { slug: "south-america", label: "South America" },
  { slug: "europe", label: "Europe" },
  { slug: "africa", label: "Africa" },
  { slug: "middle-east", label: "Middle East" },
  { slug: "asia", label: "Asia" },
  { slug: "oceania", label: "Oceania" },
  { slug: "global", label: "Global" },
];

export function regionBySlug(slug: string): RegionConfig | undefined {
  return REGIONS.find((r) => r.slug === slug);
}
