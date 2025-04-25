import fs from "fs";
import path from "path";

const CACHE_DIR = path.resolve(process.cwd(), ".cache");

export function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
  }
}

export function getCacheFilePath(name: string) {
  return path.join(CACHE_DIR, `${name}.json`);
}

export async function readCache(key: string): Promise<{ timestamp: number; data: any } | null> {
  ensureCacheDir();
  const filePath = getCacheFilePath(key);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function writeCache(key: string, data: any) {
  ensureCacheDir();
  const filePath = getCacheFilePath(key);
  const payload = {
    timestamp: Date.now(),
    data,
  };
  await fs.promises.writeFile(filePath, JSON.stringify(payload), "utf-8");
}
