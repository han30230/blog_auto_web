import type { IKeywordAdapter, NormalizedKeyword, FetchOptions } from "./types";
import { withRateLimit, withRetry, isolateSource } from "./base";

export const googleTrendsAdapter: IKeywordAdapter = {
  source: "google_trends",

  async fetchKeywords(options: FetchOptions): Promise<NormalizedKeyword[]> {
    const result = await isolateSource(
      "google_trends",
      () =>
        withRateLimit("google_trends", () =>
          withRetry(() => fetchGoogleTrends(options))
        )
    );
    if (!result.ok) throw new Error(result.error);
    return result.data;
  },
};

async function fetchGoogleTrends(options: FetchOptions): Promise<NormalizedKeyword[]> {
  // MVP: No official public API without alpha access. Return sample data for demo.
  const country = options.country ?? "KR";
  const language = options.language ?? "ko";
  const now = new Date();
  const seedKeywords = options.keywords?.length
    ? options.keywords
    : ["블로그", "SEO", "키워드", "콘텐츠", "마케팅"];
  return seedKeywords.map((keyword, i) => ({
    keyword,
    source: "google_trends" as const,
    country,
    language,
    collected_at: now,
    trend_score_relative: 20 + Math.random() * 80,
    monthly_search_volume: null,
    monthly_search_volume_mobile: null,
    monthly_search_volume_pc: null,
    monthly_clicks: null,
    ctr: null,
    competition_level: null,
    cpc_low: null,
    cpc_high: null,
    rising_score: 10 + Math.random() * 90,
    freshness_score: 50 + Math.random() * 50,
    source_confidence: 0.8,
    raw_payload: { rank: i + 1, index: Math.floor(20 + Math.random() * 80) },
  }));
}
