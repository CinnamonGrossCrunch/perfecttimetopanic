export const runtime = "nodejs";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import { redisReadCache } from "../../../lib/cacheUtils";
import { buildFeed, type Feed } from "../../../lib/buildFeed";
import { regionBySlug, REGIONS } from "../../../lib/regions";
import { SECTIONS } from "../../../lib/sections";
import { SiteHeader } from "../../../components/SiteHeader";
import { SectionView } from "../../../components/SectionView";

const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export async function generateStaticParams() {
  return REGIONS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = regionBySlug(slug);
  if (!region) return { title: "Worrry" };
  return {
    title: `Threats in ${region.label} — Worrry`,
    description: `Articles tracking threats in ${region.label}.`,
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = regionBySlug(slug);
  if (!region) notFound();

  let feed = (await redisReadCache("feed")) as Feed | null;
  const ageMs = feed ? Date.now() - new Date(feed.generatedAt).getTime() : Infinity;
  if (!feed || ageMs > MAX_AGE_MS) {
    feed = await buildFeed();
  }

  // All articles whose classifier geography tags include this region.
  const regionArticles = feed.articles
    .map((article, i) => ({ article, summary: feed!.summaries[i] }))
    .filter((x) => x.article.relevance?.geographies?.includes(region.slug));

  // Split region articles across the existing topic sections.
  const sections = SECTIONS.map((section) => ({
    section,
    items: regionArticles.filter((x) => x.article.relevance?.topics?.includes(section.topic)),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="relative min-h-screen font-sans text-foreground">
      <SiteHeader variant="page" />

      <main className="relative mx-auto max-w-6xl px-6 pt-24 pb-32">
        <div className="mt-4">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-white/80"
          >
            ← All threats
          </Link>
          <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-red-400/80">
            Region
          </p>
          <h1 className="mt-1 font-['Libre_Baskerville',serif] text-[40px] font-bold leading-[1.1] text-[#f9f3e6] md:text-[56px]">
            {region.label}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/40">
            {regionArticles.length} article{regionArticles.length !== 1 ? "s" : ""} tracked
          </p>
        </div>

        {sections.length === 0 ? (
          <p className="mt-16 text-center text-sm text-white/50">
            Nothing specific to {region.label} surfacing right now.
          </p>
        ) : (
          sections.map(({ section, items }) => (
            <SectionView
              key={section.slug}
              label={section.label}
              slug={section.slug}
              items={items}
            />
          ))
        )}
      </main>
    </div>
  );
}
