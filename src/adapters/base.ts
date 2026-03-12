import { cacheGet, cacheSet } from "@/lib/redis";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const CACHE_TTL = 3600;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const rateLimitKey = (source: string) => `ratelimit:${source}`;
const cacheKey = (source: string, opts: string) => `adapter:${source}:${opts}`;

export async function withRateLimit<T>(source: string, fn: () => Promise<T>): Promise<T> {
  const redis = await import("@/lib/redis").then((m) => m.getRedis());
  if (redis) {
    const key = rateLimitKey(source);
    const count = await redis.incr(key);
    if (count === 1) await redis.pexpire(key, RATE_LIMIT_WINDOW_MS);
    if (count > RATE_LIMIT_MAX) {
      await new Promise((r) => setTimeout(r, 2000));
      return withRateLimit(source, fn);
    }
  }
  return fn();
}

export async function withCache<T>(
  source: string,
  opts: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  const key = cacheKey(source, JSON.stringify(opts));
  const cached = await cacheGet<T>(key);
  if (cached != null) return cached;
  const result = await fn();
  await cacheSet(key, result, CACHE_TTL);
  return result;
}

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (i < MAX_RETRIES - 1) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
    }
  }
  throw lastError;
}

export function isolateSource<T>(source: string, fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  return fn()
    .then((data) => ({ ok: true as const, data }))
    .catch((err) => ({ ok: false as const, error: err?.message ?? String(err) }));
}
