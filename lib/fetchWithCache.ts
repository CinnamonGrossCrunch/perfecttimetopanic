import { readCache, writeCache } from "./cacheUtils";

export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  maxAgeMs = 1000 * 60 * 60 * 24 // default: 24 hours
): Promise<T> {
  const cached = await readCache(key); // <-- add await

  const now = Date.now();

  if (cached && cached.timestamp && now - cached.timestamp < maxAgeMs) {
    return cached.data;
  }

  const fresh = await fetchFn();
  writeCache(key, { timestamp: now, data: fresh });
  return fresh;
}
