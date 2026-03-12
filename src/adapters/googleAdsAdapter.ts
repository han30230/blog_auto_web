import type { IKeywordAdapter, NormalizedKeyword, FetchOptions } from "./types";
import { withRateLimit, withRetry, isolateSource } from "./base";

export const googleAdsAdapter: IKeywordAdapter = {
  source: "google_ads",

  async fetchKeywords(options: FetchOptions): Promise<NormalizedKeyword[]> {
    const result = await isolateSource(
      "google_ads",
      () =>
        withRateLimit("google_ads", () =>
          withRetry(() => fetchGoogleAds(options))
        )
    );
    if (!result.ok) throw new Error(result.error);
    return result.data;
  },
};

async function fetchGoogleAds(options: FetchOptions): Promise<NormalizedKeyword[]> {
  // MVP: Google Ads API requires OAuth + customer ID. Return sample data for demo.
  const country = options.country ?? "KR";
  const language = options.language ?? "ko";
  const now = new Date();
  const seedKeywords = options.keywords?.length
    ? options.keywords
    : ["블로그 글쓰기", "키워드 분석", "SEO 도구", "콘텐츠 마케팅", "검색량"];
  return seedKeywords.map((kw, i) => ({
    keyword: kw,
    source: "google_ads" as const,
    country,
    language,
    collected_at: now,
    trend_score_relative: null,
    monthly_search_volume: 1000 + Math.floor(Math.random() * 9000),
    monthly_search_volume_mobile: null,
    monthly_search_volume_pc: null,
    monthly_clicks: 100 + Math.floor(Math.random() * 500),
    ctr: 2 + Math.random() * 5,
    competition_level: Math.random() * 0.8 + 0.1,
    cpc_low: 50 + Math.random() * 200,
    cpc_high: 100 + Math.random() * 400,
    rising_score: null,
    freshness_score: null,
    source_confidence: 0.9,
    raw_payload: { competitionIndex: "LOW", avgMonthlySearches: 5000 },
  }));
}
