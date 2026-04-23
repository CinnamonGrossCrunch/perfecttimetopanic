import Parser from "rss-parser";
import * as cheerio from "cheerio";

const parser = new Parser();

// Scrape Open Graph image if available with timeout support
async function fetchOGImage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000); // 7 second timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await res.text();
    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr("content");
    return ogImage || null;
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.warn("⚠️ Timeout while fetching og:image:", url);
    } else {
      console.warn("⚠️ Failed to fetch og:image for", url, err.message);
    }
    return null;
  }
}

export async function fetchRSSFeed(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);

    const articles = await Promise.all(
      (feed.items || []).slice(0, 8).map(async (item) => {
        const url = item.link || "";
        const ogImage = await fetchOGImage(url);

        return {
          title: item.title || "Untitled",
          description: item.contentSnippet || item.content || "",
          url,
          publishedAt: item.pubDate || new Date().toISOString(),
          source: { name: feed.title || "RSS Source" },
          feedUrl,
          thumbnail: ogImage,
        };
      })
    );

    return articles;
  } catch (err) {
    console.error("❌ Failed to fetch RSS feed:", feedUrl, err);
    return [];
  }
}
