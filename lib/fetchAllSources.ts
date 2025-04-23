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
    .filter(Boolean); // Remove undefined if any feed is empty

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

  // Sort by published date
  return unique.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
