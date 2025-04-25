import fs from "fs/promises";
import path from "path";
import { franc } from "franc";
import Sentiment from "sentiment";
import { fetchFromGNews } from "./fetchFromGNews";
import { fetchRSSFeed } from "./fetchRSSFeed";

const sentiment = new Sentiment();
const CACHE_FILE = path.join(process.cwd(), "cache", "articles.json");

const SUBSTACKS = [
  "https://bloodinthemachine.substack.com/feed",
  "https://noahpinion.substack.com/feed",
];

const ALL_MEDIUM_TAGS = [
  "dystopia", "fear", "authoritarianism", "climate-change",
  "war", "pandemic", "world-war-iii", "dictatorship",
  "totalitarianism", "discrimination", "inequity", "ethics"
];

const OPINION_FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/Opinion.xml",
  "https://feeds.washingtonpost.com/rss/opinions",
  "https://www.theguardian.com/commentisfree/rss",
  "https://www.latimes.com/opinion/rss2.0.xml"
];

const EXCLUDED_MEDIUM_TAGS = [
  "fiction", "science-fiction", "sci-fi",
  "video-games", "gaming", "cryptocurrency", "crypto"
];

// Rotate through Medium tags in 3-hour blocks
function rotateTagsEvery3Hours(tags: string[], buckets = 4) {
  const now = new Date();
  const index = Math.floor((now.getUTCHours() % 24) / 3) % buckets;
  const split = Array.from({ length: buckets }, (_, i) =>
    tags.filter((_, j) => j % buckets === i)
  );
  return split[index];
}

function normalizeUrl(url: string): string {
  return url?.split("?")[0].split("#")[0].trim().toLowerCase();
}

function deduplicate(articles: any[]): any[] {
  const seen = new Set();
  return articles.filter(article => {
    const id = normalizeUrl(article.url || article.link || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function isFromExcludedMediumTag(article: any): boolean {
  const feedUrl = article.feedUrl?.toLowerCase() || "";
  return EXCLUDED_MEDIUM_TAGS.some(tag => feedUrl.includes(`/tag/${tag}`));
}

function isEnglish(article: any): boolean {
  const text = [article.title, article.description, article.content].filter(Boolean).join(" ");
  return franc(text, { minLength: 10 }) === "eng";
}

function isNegativeAIArticle(article: any): boolean {
  const text = [article.title, article.description, article.content].filter(Boolean).join(" ").toLowerCase();
  const sentimentResult = sentiment.analyze(text);

  const aiKeywords = ["ai", "artificial intelligence"];
  const negativeKeywords = [
    "danger", "threat", "risk", "warning", "catastrophe", "dystopia", "doom", "crisis",
    "collapse", "apocalypse", "existential", "harm", "problem", "panic", "alarm", "fear",
    "disaster", "out of control", "uncontrollable", "killer", "weapon", "misuse", "bias"
  ];

  return (
    aiKeywords.some(ai => text.includes(ai)) &&
    sentimentResult.score < -1 &&
    negativeKeywords.some(neg => text.includes(neg))
  );
}

function tagOpEd(article: any): any {
  if (OPINION_FEEDS.some(url => article.feedUrl?.startsWith(url))) {
    return { ...article, category: "op-ed" };
  }
  return article;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Cache utilities
async function readCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(data);
    const isRecent = Date.now() - new Date(parsed.date).getTime() < 3 * 60 * 60 * 1000;
    return isRecent ? parsed.articles : null;
  } catch {
    return null;
  }
}

async function writeCache(articles: any[]) {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify({ date: new Date(), articles }, null, 2));
  } catch (err) {
    console.error("❌ Failed to write cache:", err);
  }
}

export async function fetchAllSources() {
  const cached = await readCache();
  if (cached) {
    console.log("📦 Using cached feed");
    return cached;
  }

  const gnews = await fetchFromGNews();

  const rotatingMediumTags = rotateTagsEvery3Hours(ALL_MEDIUM_TAGS);
  const mediumFeeds = rotatingMediumTags.map(tag => `https://medium.com/feed/tag/${tag}`);
  const allFeeds = [...SUBSTACKS, ...mediumFeeds, ...OPINION_FEEDS];

  const rssFeeds = [];
  for (const url of allFeeds) {
    try {
      const feed = await fetchRSSFeed(url);
      rssFeeds.push(feed);
    } catch (err) {
      console.error("❌ RSS fetch failed:", url, err);
      rssFeeds.push([]);
    }
    await new Promise(res => setTimeout(res, 500)); // throttle
  }

  const all = [...gnews, ...rssFeeds.flat()];
  const unique = deduplicate(all);
  const englishOnly = unique.filter(isEnglish);

  const filtered = englishOnly
    .filter(a => !isFromExcludedMediumTag(a))
    .filter(a => {
      const isAI = a.title?.toLowerCase().includes("ai") || a.description?.toLowerCase().includes("ai");
      return !isAI || isNegativeAIArticle(a);
    })
    .map(tagOpEd);

  const substack = filtered.filter(a => SUBSTACKS.some(url => a.feedUrl?.startsWith(url)));
  const medium = filtered.filter(a => mediumFeeds.some(url => a.feedUrl?.startsWith(url)));
  const opeds = filtered.filter(a => a.category === "op-ed");
  const gnewsOnly = filtered.filter(a => a.source?.name?.toLowerCase().includes("gnews"));
  const other = filtered.filter(
    a => !substack.includes(a) && !medium.includes(a) && !opeds.includes(a) && !gnewsOnly.includes(a)
  );

  const topSubstack = substack
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 2);

  const remainingSubstack = substack.filter(a => !topSubstack.includes(a));
  const nonSubstack = [...opeds, ...remainingSubstack, ...medium, ...gnewsOnly, ...other];

  nonSubstack.sort((a, b) => {
    const pop = (b.popularity ?? 0) - (a.popularity ?? 0);
    if (pop !== 0) return pop;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const final = [...topSubstack, ...nonSubstack];
  await writeCache(final);
  return final;
}
