export const runtime = "nodejs";
export const revalidate = 0;

import { notFound } from "next/navigation";
import Link from "next/link";
import { redisReadCache } from "../../../lib/cacheUtils";
import { buildFeed, type Feed } from "../../../lib/buildFeed";
import { sectionBySlug, SECTIONS } from "../../../lib/sections";
import { SiteHeader } from "../../../components/SiteHeader";
import { SectionView } from "../../../components/SectionView";

const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export async function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = sectionBySlug(slug);
  if (!section) return { title: "Worrry" };
  return {
    title: `${section.label} — Worrry`,
    description: `Threats tracked under ${section.label}.`,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = sectionBySlug(slug);
  if (!section) notFound();

  let feed = (await redisReadCache("feed")) as Feed | null;
  const ageMs = feed ? Date.now() - new Date(feed.generatedAt).getTime() : Infinity;
  if (!feed || ageMs > MAX_AGE_MS) {
    feed = await buildFeed();
  }

  const items = feed.articles
    .map((article, i) => ({ article, summary: feed!.summaries[i] }))
    .filter((x) => x.article.relevance?.topics?.includes(section.topic));

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
          <h1 className="mt-3 font-['Libre_Baskerville',serif] text-[40px] font-bold leading-[1.1] text-[#f9f3e6] md:text-[56px]">
            {section.label}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/40">
            {items.length} article{items.length !== 1 ? "s" : ""} tracked
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-16 text-center text-sm text-white/50">
            Nothing surfacing under this topic right now.
          </p>
        ) : (
          <SectionView label="Latest" items={items} showMoreLink={false} />
        )}
      </main>
    </div>
  );
}
