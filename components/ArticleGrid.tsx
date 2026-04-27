import type { Editorial } from "../lib/worrryEditorial";
import { SiteHeader } from "./SiteHeader";
import { ArticleCard, type Article, type Summary } from "./ArticleCard";
import { ListCard } from "./ListCard";
import { EditorialCard } from "./EditorialCard";
import { TopicsNav } from "./TopicsNav";
import { ActionOverlay } from "./ActionOverlay";

type Props = {
  articles: Article[];
  summaries: Summary[];
  editorial: Editorial | null;
};

type Item = { article: Article; summary: Summary | undefined };

const LEFT_RAIL_COUNT = 4;
const RIGHT_RAIL_COUNT = 4;
const SECONDARY_COUNT = 6;
const MORE_COUNT = 12;

function computeTopicCounts(articles: Article[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of articles) {
    for (const t of a.relevance?.topics ?? []) {
      out[t] = (out[t] ?? 0) + 1;
    }
  }
  return out;
}

function todayLong(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function RailHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b-2 border-black pb-2 font-['Libre_Baskerville',serif] text-[13px] font-bold uppercase tracking-[0.18em] text-gray-900">
      {children}
    </h2>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 border-b-4 border-black pb-3 font-['Libre_Baskerville',serif] text-2xl font-bold uppercase tracking-wider text-gray-900">
      {children}
    </h2>
  );
}

export default function ArticleGrid({ articles, summaries, editorial }: Props) {
  const items: Item[] = articles.map((article, i) => ({
    article,
    summary: summaries[i],
  }));

  const heroFromArticles = items[0];

  let cursor = 1;
  const leftRail = items.slice(cursor, cursor + LEFT_RAIL_COUNT);
  cursor += LEFT_RAIL_COUNT;
  const rightRail = items.slice(cursor, cursor + RIGHT_RAIL_COUNT);
  cursor += RIGHT_RAIL_COUNT;
  const secondary = items.slice(cursor, cursor + SECONDARY_COUNT);
  cursor += SECONDARY_COUNT;
  const more = items.slice(cursor, cursor + MORE_COUNT);

  const editorialImage =
    articles.find((a) => a.thumbnail || a.image)?.thumbnail ??
    articles.find((a) => a.thumbnail || a.image)?.image ??
    null;

  const topicCounts = computeTopicCounts(articles);

  return (
    <div className="relative min-h-screen bg-[var(--background)] font-sans text-gray-900">
      <SiteHeader variant="home" articleCount={articles.length} />

      <main className="mx-auto max-w-[1280px] px-6 pt-20 pb-24">
        {/* ===== MASTHEAD ===== */}
        <section className="border-b-4 border-black pt-8 pb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gray-500">
            {todayLong()}
          </p>
          <h1 className="mt-3 font-['Libre_Baskerville',serif] text-[72px] font-bold leading-[0.9] tracking-tight text-gray-900 md:text-[104px]">
            Worrry<span className="text-red-600">.</span>
          </h1>
          <p className="mt-3 font-['Libre_Baskerville',serif] text-base italic text-gray-600">
            Bad News: Good timing.
          </p>
        </section>

        {items.length === 0 ? (
          <p className="mt-20 text-center text-sm text-gray-500">
            No articles to show right now. The feed will refresh shortly.
          </p>
        ) : (
          <>
            {/* ===== ABOVE-THE-FOLD: 3 - 6 - 3 ===== */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
              {/* LEFT RAIL — text-only stack */}
              <aside className="lg:col-span-3 lg:border-r lg:border-gray-300 lg:pr-6">
                <RailHeader>Latest Threats</RailHeader>
                <div className="flex flex-col">
                  {leftRail.map(({ article, summary }, i) => (
                    <ListCard
                      key={i}
                      article={article}
                      summary={summary}
                      variant="rail-text"
                    />
                  ))}
                </div>
              </aside>

              {/* CENTER STAGE */}
              <div className="lg:col-span-6">
                {editorial ? (
                  <EditorialCard editorial={editorial} imageUrl={editorialImage} />
                ) : heroFromArticles ? (
                  <ArticleCard
                    article={heroFromArticles.article}
                    summary={heroFromArticles.summary}
                    variant="hero"
                  />
                ) : null}
              </div>

              {/* RIGHT RAIL — thumbnail stack + Respond/Reclaim */}
              <aside className="lg:col-span-3 lg:border-l lg:border-gray-300 lg:pl-6">
                <RailHeader>Featured</RailHeader>
                <div className="flex flex-col">
                  {rightRail.map(({ article, summary }, i) => (
                    <ListCard
                      key={i}
                      article={article}
                      summary={summary}
                      variant="rail-thumb"
                    />
                  ))}
                </div>

                <div className="mt-8">
                  <RailHeader>Respond / Reclaim</RailHeader>
                  <ul className="flex flex-col">
                    {[
                      {
                        href: "https://mattdpearce.substack.com/p/best-ways-to-support-journalism-in",
                        label: "Support independent journalism",
                      },
                      {
                        href: "https://wellbeingtrust.org/resources/mental-health-resources/",
                        label: "Mental wellness resources",
                      },
                      {
                        href: "https://www.removepaywall.com/",
                        label: "Bypass a paywall",
                      },
                    ].map(({ href, label }) => (
                      <li key={href}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 border-b border-gray-300 py-3 text-[14px] font-medium text-gray-900 transition-colors hover:text-red-600"
                        >
                          <span>{label}</span>
                          <span aria-hidden="true" className="text-red-600">
                            →
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>

            {/* ===== MORE COVERAGE — secondary tier ===== */}
            {secondary.length > 0 && (
              <section className="mt-16">
                <SectionHeader>More Coverage</SectionHeader>
                <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                  {secondary.map(({ article, summary }, i) => (
                    <ArticleCard
                      key={i}
                      article={article}
                      summary={summary}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ===== BRIEFS — dense list ===== */}
            {more.length > 0 && (
              <section className="mt-16">
                <SectionHeader>Briefs</SectionHeader>
                <div className="grid gap-x-10 md:grid-cols-2">
                  {more.map(({ article, summary }, i) => (
                    <ListCard key={i} article={article} summary={summary} />
                  ))}
                </div>
              </section>
            )}

            <TopicsNav counts={topicCounts} />
          </>
        )}
      </main>

      <footer className="border-t border-gray-300 pt-8 pb-12 text-center text-xs uppercase tracking-[0.18em] text-gray-500">
        <p>Awareness is power · A Gross Domestic Production</p>
      </footer>

      <ActionOverlay />
    </div>
  );
}
