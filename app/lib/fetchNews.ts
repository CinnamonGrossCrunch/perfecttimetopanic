// lib/fetchNews.ts
export async function fetchNews() {
    const API_KEY = "0a7a07435a303d2b093edbd68159819a"; 
    const query = "existential threat";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=en&max=5&apikey=${API_KEY}`;
  
    try {
      const res = await fetch(url);
      console.log("[FETCH] GNews response status:", res.status);
      const data = await res.json();
      console.log("[FETCH] GNews data:", data);
      return data.articles || [];
    } catch (err) {
      console.error("[ERROR] Failed to fetch GNews articles:", err);
      return [];
    }
  }
  