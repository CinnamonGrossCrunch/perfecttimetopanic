export const runtime = "nodejs";
export const revalidate = 0;

import ArticleGrid from "../components/ArticleGrid";
import { redisReadCache } from "../lib/cacheUtils";
import { buildFeed, type Feed } from "../lib/buildFeed";

// Consider the cache stale after this much time. The cron refreshes every ~2h; this is a
// safety net so a stuck cron doesn't serve week-old news forever.
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export default async function Home() {
  let feed = (await redisReadCache("feed")) as Feed | null;

  const ageMs = feed ? Date.now() - new Date(feed.generatedAt).getTime() : Infinity;
  if (!feed || ageMs > MAX_AGE_MS) {
    console.log("[page] feed cache cold or stale — rebuilding inline");
    feed = await buildFeed();
  }

  return (
    <ArticleGrid
      articles={feed.articles}
      summaries={feed.summaries}
      editorial={feed.editorial ?? null}
    />
  );
}
