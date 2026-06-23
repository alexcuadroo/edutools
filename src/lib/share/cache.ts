const CACHE_PREFIX = "puzzle-id:";
const MAX_ENTRIES = 200;

interface CacheEntry {
  id: string;
  ts: number;
}

function readAll(): Record<string, CacheEntry> {
  if (typeof window === "undefined") return {};
  const out: Record<string, CacheEntry> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(CACHE_PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as CacheEntry;
      if (typeof parsed.id === "string" && typeof parsed.ts === "number") {
        out[key.slice(CACHE_PREFIX.length)] = parsed;
      }
    }
  } catch {
    return {};
  }
  return out;
}

function writeAll(entries: Record<string, CacheEntry>): void {
  if (typeof window === "undefined") return;
  try {
    const items = Object.entries(entries);
    if (items.length > MAX_ENTRIES) {
      items.sort((a, b) => a[1].ts - b[1].ts);
      for (const [key] of items.slice(0, items.length - MAX_ENTRIES)) {
        window.localStorage.removeItem(CACHE_PREFIX + key);
      }
    }
    for (const [hash, entry] of items) {
      window.localStorage.setItem(CACHE_PREFIX + hash, JSON.stringify(entry));
    }
  } catch {
    void 0;
  }
}

export function getCachedId(hash: string): string | null {
  const entries = readAll();
  return entries[hash]?.id ?? null;
}

export function setCachedId(hash: string, id: string): void {
  const entries = readAll();
  entries[hash] = { id, ts: Date.now() };
  writeAll(entries);
}
