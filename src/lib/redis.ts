const REDIS_URL = process.env.REDIS_URL;

let redis: import("ioredis").Redis | null = null;

export function getRedis(): import("ioredis").Redis | null {
  if (!REDIS_URL) return null;
  if (redis) return redis;
  try {
    const Redis = require("ioredis");
    redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 });
    return redis;
  } catch {
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    const raw = await r.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // ignore
  }
}
