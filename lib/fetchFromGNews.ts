import { fetchOGImage } from "./fetchOGImage";

export async function fetchFromGNews() {
  const API_KEY = process.env.GNEWS_API_KEY;
  const query = [
    "existential threat",
    "climate change",
    "AI",
    "nuclear war",
    "pandemic",
    "democracy",
    "authoritarianism"
  ].join(" OR ");

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return await Promise.all(
      (data.articles || []).map(async (article: any) => {
        const image = article.image || (await fetchOGImage(article.url));
        return {
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: { name: article.source.name },
          thumbnail: image || null,
        };
      })
    );
  } catch (err) {
    console.error("❌ Failed to fetch from GNews:", err);
    return [];
  }
}
