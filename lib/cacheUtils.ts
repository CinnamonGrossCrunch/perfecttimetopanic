// lib/cacheUtils.ts
import fs from "fs/promises";
import path from "path";
import { Redis } from "@upstash/redis";

const CACHE_DIR = path.join(process.cwd(), "cache");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function readCache(key: string): Promise<any | null> {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  try {
    const data = await fs.readFile(cacheFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function writeCache(key: string, obj: any) {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(obj, null, 2));
}

export async function clearCache(key: string) {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  try {
    await fs.unlink(cacheFile);
    return true;
  } catch {
    return false;
  }
}

export async function redisReadCache(key: string) {
  return await redis.get(key);
}

export async function redisWriteCache(key: string, value: any) {
  await redis.set(key, value);
}

export async function redisClearCache(key: string) {
  await redis.del(key);
}
