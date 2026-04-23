import { franc } from "franc";
import { fetchFromGNews } from "./fetchFromGNews";
import { fetchRSSFeed } from "./fetchRSSFeed";

// Curated Substacks — high signal. Custom-domain Substacks are also supported
// (they expose /feed at their own domain); add with the full URL.
const SUBSTACKS = [
  // Tech / labor / AI critique
  "https://bloodinthemachine.substack.com/feed", // Brian Merchant
  "https://readmax.substack.com/feed", // Max Read

  // Economics / policy
  "https://noahpinion.substack.com/feed", // Noah Smith
  "https://mattstoller.substack.com/feed", // Matt Stoller, BIG — antitrust
  "https://paulkrugman.substack.com/feed", // Paul Krugman
  "https://hamiltonnolan.substack.com/feed", // Hamilton Nolan — labor

  // Authoritarianism / democracy / rule of law
  "https://heathercoxrichardson.substack.com/feed", // Letters from an American
  "https://snyder.substack.com/feed", // Timothy Snyder — Thinking about…
  "https://lucid.substack.com/feed", // Ruth Ben-Ghiat — Lucid
  "https://joycevance.substack.com/feed", // Joyce Vance — Civil Discourse
  "https://contrarian.substack.com/feed", // Jennifer Rubin et al. — The Contrarian
  "https://messagebox.substack.com/feed", // Dan Pfeiffer — The Message Box
  "https://statuskuo.substack.com/feed", // Jay Kuo — The Status Kuo

  // Climate
  "https://billmckibben.substack.com/feed", // Bill McKibben — The Crucial Years
  "https://www.volts.wtf/feed", // David Roberts — Volts (climate & energy)
  "https://heated.world/feed", // Emily Atkin — HEATED

  // Geopolitics / war
  "https://phillipspobrien.substack.com/feed", // Phillips O'Brien

  // Corporate accountability / tech critique (custom domains)
  "https://popular.info/feed", // Judd Legum — Popular Information
  "https://www.wheresyoured.at/feed", // Ed Zitron — Where's Your Ed At
  "https://www.programmablemutter.com/feed", // Henry Farrell — Programmable Mutter
];

// BBC topic-specific feeds (world/politics/science replace the firehose "all news" feed).
const BBC_FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://feeds.bbci.co.uk/news/politics/rss.xml",
  "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
];

// Guardian opinion + topic sections.
const GUARDIAN_FEEDS = [
  "https://www.theguardian.com/commentisfree/rss",
  "https://www.theguardian.com/environment/rss",
  "https://www.theguardian.com/us-news/us-politics/rss",
];

// Other opinion columns (classifier filters non-threat pieces).
const OPINION_FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/Opinion.xml",
  "https://feeds.washingtonpost.com/rss/opinions",
  "https://www.latimes.com/opinion/rss2.0.xml",
];

// Investigative / specialty outlets — largely open-licensed, on-topic by design.
const INVESTIGATIVE_FEEDS = [
  "https://www.propublica.org/feeds/propublica/main",
  "https://theintercept.com/feed/?lang=en",
  "https://www.democracynow.org/democracynow.rss",
  "https://grist.org/feed/",
  "https://restofworld.org/feed/latest/",
  "https://www.lawfaremedia.org/feeds/articles",
  "https://www.motherjones.com/feed/",
];

// Mainstream news — firehoses gated by the relevance classifier.
const MAINSTREAM_FEEDS = [
  // Al Jazeera (back — was dropped with the rest of the firehose feeds)
  "https://www.aljazeera.com/xml/rss/all.xml",
  // NPR topic feeds
  "https://feeds.npr.org/1001/rss.xml", // News
  "https://feeds.npr.org/1002/rss.xml", // World
  "https://feeds.npr.org/1014/rss.xml", // Politics
  // Other political/policy mainstream
  "https://thehill.com/feed/",
  "https://www.theatlantic.com/feed/channel/politics/",
  "https://www.theatlantic.com/feed/channel/technology/",
  "https://www.vox.com/rss/index.xml",
  "https://www.foreignaffairs.com/rss.xml",
];

// Research signal — AI risk / computers-and-society preprints.
const RESEARCH_FEEDS = [
  "https://export.arxiv.org/rss/cs.CY",
  "https://export.arxiv.org/rss/cs.AI",
];

// rss.app existential-threat keyword feed (kept).
const RSS_APP_FEEDS = [
  "https://rss.app/rss-feed?keyword=existential%20threat&region=US&lang=en",
];

const ALL_FEEDS = [
  ...SUBSTACKS,
  ...BBC_FEEDS,
  ...GUARDIAN_FEEDS,
  ...OPINION_FEEDS,
  ...INVESTIGATIVE_FEEDS,
  ...MAINSTREAM_FEEDS,
  ...RESEARCH_FEEDS,
  ...RSS_APP_FEEDS,
];

function normalizeUrl(url: string): string {
  return url?.split("?")[0].split("#")[0].trim().toLowerCase();
}

function deduplicate<T extends { url?: string; link?: string }>(articles: T[]): T[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const id = normalizeUrl(a.url || a.link || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function isEnglish(article: any): boolean {
  const text = [article.title, article.description, article.content].filter(Boolean).join(" ");
  return franc(text, { minLength: 10 }) === "eng";
}

function tagOpEd(article: any): any {
  const opinionRoots = [...OPINION_FEEDS, ...GUARDIAN_FEEDS.filter((u) => u.includes("commentisfree"))];
  if (opinionRoots.some((url) => article.feedUrl?.startsWith(url))) {
    return { ...article, category: "op-ed" };
  }
  return article;
}

/**
 * Run async `fn` over `items` with a max concurrency. Preserves input order.
 */
async function parallelMap<T, U>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<U>
): Promise<U[]> {
  const results: U[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        results[i] = await fn(items[i], i);
      } catch {
        results[i] = undefined as unknown as U;
      }
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Gather raw candidate articles from all sources. No caching, no classification, no summarization —
 * those happen in buildFeed. Returns deduped, English-only articles that have an image.
 */
export async function fetchAllSources() {
  const [gnews, rssBatches] = await Promise.all([
    fetchFromGNews().catch((e) => {
      console.error("❌ GNews fetch failed:", e);
      return [];
    }),
    parallelMap(ALL_FEEDS, 4, async (url) => {
      try {
        return await fetchRSSFeed(url);
      } catch (err) {
        console.error("❌ RSS fetch failed:", url, err);
        return [];
      }
    }),
  ]);

  const all = [...gnews, ...rssBatches.flat()];
  const unique = deduplicate(all);
  const englishOnly = unique.filter(isEnglish);
  const withImage = englishOnly.filter((a) => a.thumbnail || a.image);
  return withImage.map(tagOpEd);
}
