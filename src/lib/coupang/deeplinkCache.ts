import { promises as fs } from "fs";
import path from "path";

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_DIR = path.join(process.cwd(), ".cache", "coupang");
const CACHE_FILE = path.join(CACHE_DIR, "deeplink.json");

type Entry = {
  originalUrl: string;
  shortenUrl: string;
  expiresAt: number;
};

type Persisted = {
  entries: Record<string, { shortenUrl: string; expiresAt: number }>;
};

const mem = new Map<string, Entry>();

async function ensureDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

async function readFile(): Promise<Persisted | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

async function writeFile(p: Persisted) {
  try {
    await ensureDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify(p, null, 2), "utf8");
  } catch {
    // ignore (read-only FS 등)
  }
}

export async function getCachedDeeplink(originalUrl: string): Promise<string | null> {
  const now = Date.now();
  const m = mem.get(originalUrl);
  if (m && now <= m.expiresAt) return m.shortenUrl;

  const persisted = await readFile();
  const e = persisted?.entries?.[originalUrl];
  if (e && now <= e.expiresAt && typeof e.shortenUrl === "string") {
    mem.set(originalUrl, { originalUrl, shortenUrl: e.shortenUrl, expiresAt: e.expiresAt });
    return e.shortenUrl;
  }
  return null;
}

export async function setCachedDeeplink(originalUrl: string, shortenUrl: string): Promise<void> {
  const expiresAt = Date.now() + TTL_MS;
  mem.set(originalUrl, { originalUrl, shortenUrl, expiresAt });

  const persisted = (await readFile()) ?? { entries: {} };
  persisted.entries[originalUrl] = { shortenUrl, expiresAt };
  await writeFile(persisted);
}

