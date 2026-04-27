import { fetchAllSources } from "./fetchAllSources";
import { classifyRelevance, type Relevance } from "./classifyRelevance";
import { summarizeWithGPT, type StructuredSummary } from "./summarizeWithGPT";
import { generateEditorial, type Editorial } from "./worrryEditorial";
import { redisWriteCache } from "./cacheUtils";

export type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  thumbnail?: string | null;
  image?: string | null;
  source: { name: string };
  category?: string;
  feedUrl?: string;
  relevance?: Relevance;
};

export type Feed = {
  generatedAt: string;
  editorial: Editorial | null;
  articles: Article[];
  summaries: StructuredSummary[];
};

const MIN_SCORE = 5; // 5 = adjacent, 6-7 = relevant, 8-10 = central. Below 5 is unrelated.
const MAX_ARTICLES = 60; // cap summarization spend per refresh
const EDITORIAL_INPUT_SIZE = 25; // top-N articles fed to the editorial

function sourceLabel(a: Article): string {
  if (a.feedUrl) {
    try {
      return new URL(a.feedUrl).hostname.replace(/^www\./, "");
    } catch {
      return a.feedUrl;
    }
  }
  return a.source?.name ?? "unknown";
}

function countBy<T>(items: T[], key: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

function formatCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
}

/**
 * Build a fresh feed: fetch candidates → classify relevance (multi-topic + geography) →
 * filter/rank → summarize top N → generate Worrry editorial → return the result
 * and write to Redis "feed" key.
 */
export async function buildFeed(): Promise<Feed> {
  const start = Date.now();
  const candidates = (await fetchAllSources()) as Article[];
  console.log(`[buildFeed] gathered ${candidates.length} candidates in ${Date.now() - start}ms`);
  console.log(`[buildFeed]   by source: ${formatCounts(countBy(candidates, sourceLabel))}`);

  const classifierInput = candidates.map((a) => ({
    url: a.url,
    title: a.title ?? "",
    description: a.description ?? "",
  }));
  const scores = await classifyRelevance(classifierInput);

  const withScores = candidates.map((a, i) => ({ ...a, relevance: scores[i] }));
  const kept = withScores.filter((a) => (a.relevance?.score ?? 0) >= MIN_SCORE);
  const dropped = withScores.filter((a) => (a.relevance?.score ?? 0) < MIN_SCORE);

  kept.sort((a, b) => {
    const s = (b.relevance?.score ?? 0) - (a.relevance?.score ?? 0);
    if (s !== 0) return s;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const top = kept.slice(0, MAX_ARTICLES);
  console.log(
    `[buildFeed] kept ${top.length}/${candidates.length} after classifier (min score ${MIN_SCORE})`
  );
  console.log(`[buildFeed]   kept by source:    ${formatCounts(countBy(top, sourceLabel))}`);
  console.log(`[buildFeed]   dropped by source: ${formatCounts(countBy(dropped, sourceLabel))}`);

  const summaries = await Promise.all(
    top.map((a) =>
      summarizeWithGPT({
        url: a.url,
        title: a.title,
        description: a.description,
      })
    )
  );

  // Generate editorial from the top articles. Non-blocking failure — if this returns
  // null, the homepage simply renders without the editorial card.
  const editorialInput = top.slice(0, EDITORIAL_INPUT_SIZE).map((a, i) => ({
    url: a.url,
    title: a.title,
    description: a.description,
    topics: a.relevance?.topics ?? [],
    source: sourceLabel(a),
    publishedAt: a.publishedAt,
    panic: summaries[i]?.["the panic"],
    hope: summaries[i]?.["the hope"],
  }));
  const editorial = await generateEditorial(editorialInput);

  const feed: Feed = {
    generatedAt: new Date().toISOString(),
    editorial,
    articles: top,
    summaries,
  };

  await redisWriteCache("feed", feed);
  console.log(
    `[buildFeed] done in ${Date.now() - start}ms (editorial: ${editorial ? "yes" : "no"})`
  );
  return feed;
}
