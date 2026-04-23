// Classifier topic → human-facing section. slug is the URL param for the section sub-page
// (e.g. /section/democracy-in-crisis). Order defines display order on the homepage.

export type SectionConfig = {
  topic: string;
  slug: string;
  label: string;
  shortTag: string;
};

export const SECTIONS: SectionConfig[] = [
  { topic: "authoritarianism", slug: "democracy-in-crisis", label: "Democracy in Crisis", shortTag: "DEMOCRACY" },
  { topic: "war-nuclear", slug: "nuclear-and-war", label: "Nuclear & War", shortTag: "NUCLEAR" },
  { topic: "ai-risk", slug: "ai-threats", label: "AI Threats", shortTag: "AI" },
  { topic: "climate", slug: "climate-crisis", label: "Climate Crisis", shortTag: "CLIMATE" },
  { topic: "civil-rights", slug: "human-rights", label: "Human Rights", shortTag: "HUMAN RIGHTS" },
  { topic: "economic-collapse", slug: "financial-distress", label: "Financial Distress", shortTag: "FINANCE" },
  { topic: "pandemic", slug: "biosecurity", label: "Biosecurity", shortTag: "BIOSECURITY" },
  { topic: "surveillance", slug: "surveillance-state", label: "Surveillance State", shortTag: "SURVEILLANCE" },
  { topic: "disinformation", slug: "disinformation", label: "Disinformation", shortTag: "DISINFO" },
];

export function sectionByTopic(topic: string | undefined): SectionConfig | undefined {
  if (!topic) return undefined;
  return SECTIONS.find((s) => s.topic === topic);
}

export function sectionBySlug(slug: string): SectionConfig | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}
