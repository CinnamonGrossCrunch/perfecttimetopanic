import { createHash } from "node:crypto";

export function urlHash(url: string): string {
  const normalized = (url || "").split("?")[0].split("#")[0].trim().toLowerCase();
  return createHash("sha1").update(normalized).digest("hex").slice(0, 16);
}
