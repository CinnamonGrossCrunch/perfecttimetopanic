export async function fetchNews() {
    const API_KEY = "0a7a07435a303d2b093edbd68159819a"; // Your real key
    const query = "existential threat";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${API_KEY}`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.articles || [];
    } catch (err) {
      console.error("Failed to fetch news:", err);
      return [];
    }
  }
  
