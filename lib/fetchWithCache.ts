// lib/fetchWithCache.ts
import { readCache, writeCache } from "./cacheUtils";

export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  maxAgeMs = 3 * 60 * 60 * 1000 // 3 hours default
): Promise<T> {
  const cached = await readCache(key);

  if (cached && cached.timestamp && Date.now() - cached.timestamp < maxAgeMs) {
    return cached.data;
  }

  const fresh = await fetchFn();
  await writeCache(key, { timestamp: Date.now(), data: fresh });
  return fresh;
}
