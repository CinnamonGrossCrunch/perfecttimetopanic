// lib/fetchWithCache.ts
import { readCache, writeCache } from "./cacheUtils";

// 24 hours in milliseconds
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  maxAgeMs = ONE_DAY_MS // default to 1 day
): Promise<T> {
  const cached = await readCache(key);

  if (cached && cached.timestamp && Date.now() - cached.timestamp < maxAgeMs) {
    return cached.data;
  }

  const fresh = await fetchFn();
  await writeCache(key, { timestamp: Date.now(), data: fresh });
  return fresh;
}
