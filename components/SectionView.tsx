"use client";

import Link from "next/link";
import { ArticleCard, type Article, type Summary } from "./ArticleCard";

type Item = { article: Article; summary: Summary | undefined };

export function SectionView({
  label,
  items,
  slug,
  showMoreLink = true,
}: {
  label: string;
  items: Item[];
  slug?: string;
  /** Hide the "See all" link when already on a section/region page. */
  showMoreLink?: boolean;
}) {
  if (items.length === 0) return null;
  const [hero, ...rest] = items;

  return (
    <section className="mt-14 first:mt-8">
      <div className="mb-6 flex items-baseline justify-between border-b border-white/10 pb-3">
        {slug ? (
          <Link
            href={`/section/${slug}`}
            className="font-['Libre_Baskerville',serif] text-[22px] font-bold text-[#f9f3e6] transition-colors hover:text-white md:text-2xl"
          >
            {label}
            <span aria-hidden="true" className="ml-2 text-white/30">→</span>
          </Link>
        ) : (
          <h2 className="font-['Libre_Baskerville',serif] text-[22px] font-bold text-[#f9f3e6] md:text-2xl">
            {label}
          </h2>
        )}
        <span className="text-[10.5px] uppercase tracking-[0.2em] text-white/40">
          {items.length} article{items.length !== 1 ? "s" : ""}
          {showMoreLink && slug && <span className="ml-2 hidden md:inline">· see all</span>}
        </span>
      </div>

      <ArticleCard article={hero.article} summary={hero.summary} variant="hero" />

      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((item, i) => (
            <ArticleCard key={i} article={item.article} summary={item.summary} variant="compact" />
          ))}
        </div>
      )}
    </section>
  );
}
