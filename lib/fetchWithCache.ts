// lib/fetchWithCache.ts
import { redisReadCache, redisWriteCache } from "./cacheUtils";

// 24 hours in milliseconds
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type CacheEntry<T> = { timestamp: number; data: T } | null;

export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  maxAgeMs = ONE_DAY_MS // default to 1 day
): Promise<T> {
  const cached: CacheEntry<T> = await redisReadCache(key);

  if (cached && cached.timestamp && Date.now() - cached.timestamp < maxAgeMs) {
    return cached.data;
  }

  const fresh = await fetchFn();
  await redisWriteCache(key, { timestamp: Date.now(), data: fresh });
  return fresh;
}
