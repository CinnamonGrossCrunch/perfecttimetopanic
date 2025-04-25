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

export async function readCache(/* ...args */) {
  // implementation
}

export async function writeCache(/* ...args */) {
  // implementation
}
