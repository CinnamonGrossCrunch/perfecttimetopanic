export async function fetchFromGNews() {
    const API_KEY = process.env.GNEWS_API_KEY;
    const query = "existential threat";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=en&max=5&apikey=${API_KEY}`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
      return (data.articles || []).map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: { name: article.source.name },
      }));
    } catch (err) {
      console.error("❌ Failed to fetch from GNews:", err);
      return [];
    }
  }
  