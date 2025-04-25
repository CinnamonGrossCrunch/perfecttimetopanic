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

    return (data.articles || []).map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: { name: article.source.name },
      thumbnail: article.image || null // 👈 add this line to include thumbnails
    }));
  } catch (err) {
    console.error("❌ Failed to fetch from GNews:", err);
    return [];
  }
}
