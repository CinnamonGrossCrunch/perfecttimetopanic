// Scrape Open Graph image with manual timeout using AbortController
import * as cheerio from "cheerio";
import fetch from "node-fetch";

export async function fetchOGImage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000); // 7 seconds

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
