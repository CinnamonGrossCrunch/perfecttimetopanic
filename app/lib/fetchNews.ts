export async function fetchNews() {
    const API_KEY = "0a7a07435a303d2b093edbd68159819a"; // Your GNews API key
    const query = "existential threat OR AI risk OR climate collapse OR democracy erosion";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=6&apikey=${API_KEY}`;
  
    try {
      const res = await fetch(url);
      console.log("[FETCH] GNews status:", res.status);
  
      const data = await res.json();
      console.log("[FETCH] GNews data:", data);
  
      return data.articles || [];
    } catch (err) {
      console.error("[ERROR] Failed to fetch GNews articles:", err);
      return [];
    }
  }
  