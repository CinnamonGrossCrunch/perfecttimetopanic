import Parser from "rss-parser";
const parser = new Parser();

export async function fetchRSSFeed(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items || []).slice(0, 5).map((item) => ({
      title: item.title,
      description: item.contentSnippet || "",
      url: item.link,
      publishedAt: item.pubDate,
      source: { name: feed.title || "RSS Source" },
    }));
  } catch (err) {
    console.error("❌ Failed to fetch RSS feed:", feedUrl, err);
    return [];
  }
}
