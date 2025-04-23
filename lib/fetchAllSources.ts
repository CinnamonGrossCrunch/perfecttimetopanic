import { fetchFromGNews } from "./fetchFromGNews";
import { fetchRSSFeed } from "./fetchRSSFeed";

const SUBSTACKS = [
  "https://bloodinthemachine.substack.com/feed",
  "https://noahpinion.substack.com/feed",
];

const MEDIUM_TAGS = [
  "https://medium.com/feed/tag/ai",
  "https://medium.com/feed/tag/democracy",
  "https://medium.com/feed/tag/authoritarianism",
  "https://medium.com/feed/tag/fear",
  "https://medium.com/feed/tag/dystopia",
  "https://medium.com/feed/tag/climate-change",
  "https://medium.com/feed/tag/war",
  "https://medium.com/feed/tag/pandemic",
  "https://medium.com/feed/tag/doom",
  "https://medium.com/feed/tag/world-war-iii",
];

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function fetchAllSources() {
  const gnews = await fetchFromGNews();

  // Fetch all feeds in parallel
  const rssFeeds = await Promise.all(
    [...SUBSTACKS, ...MEDIUM_TAGS].map((url) => fetchRSSFeed(url))
  );

  // Pick the latest article from each feed
  const oneFromEachFeed = rssFeeds
    .map((articles) =>
      articles.sort(
        (a, b) =>
          new Date(b.publishedAt ?? "").getTime() - new Date(a.publishedAt ?? "").getTime()
      )[0]
    )
    .filter(Boolean);

  // Combine all articles
  const all = [...gnews, ...rssFeeds.flat()];

  // Remove duplicates (by unique id or link)
  const unique = [
    ...oneFromEachFeed,
    ...all.filter(
      (item) =>
        !oneFromEachFeed.some((feat) => feat.url === item.url)
    ),
  ];

  // Separate by source
  const substack = unique.filter(a => SUBSTACKS.some(url => a.feedUrl?.startsWith(url)));
  const medium = unique.filter(a => MEDIUM_TAGS.some(url => a.feedUrl?.startsWith(url)));
  const gnewsOnly = unique.filter(a => a.source === "gnews");
  const otherRss = unique.filter(
    a =>
      !substack.includes(a) &&
      !medium.includes(a) &&
      !gnewsOnly.includes(a)
  );

  // Shuffle non-Substack
  const shuffled = shuffle([...medium, ...gnewsOnly, ...otherRss]);

  // Prioritize Substack, then shuffled others
  const result = [...substack, ...shuffled];

  // Sort Substack by published date (optional)
  result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return result;
}
