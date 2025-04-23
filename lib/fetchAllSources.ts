import { fetchFromGNews } from "./fetchFromGNews";
import { fetchRSSFeed } from "./fetchRSSFeed";

// You can add more feeds here
const SUBSTACKS = [
  "https://bloodinthemachine.substack.com/feed",
  "https://noahpinion.substack.com/feed",
];

const MEDIUM_TAGS = [
  "https://medium.com/feed/tag/ai",
  "https://medium.com/feed/tag/democracy",
];

export async function fetchAllSources() {
  const gnews = await fetchFromGNews();

  const rssFeeds = await Promise.all(
    [...SUBSTACKS, ...MEDIUM_TAGS].map((url) => fetchRSSFeed(url))
  );

  const all = [...gnews, ...rssFeeds.flat()];
  return all.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
