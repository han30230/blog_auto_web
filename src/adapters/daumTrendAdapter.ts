import type { IKeywordAdapter, NormalizedKeyword, FetchOptions } from "./types";
import { isolateSource } from "./base";
import { featureFlags } from "@/lib/config/feature-flags";

export const daumTrendAdapter: IKeywordAdapter = {
  source: "daum_trend",

  async fetchKeywords(options: FetchOptions): Promise<NormalizedKeyword[]> {
    if (!featureFlags.daumEnabled) {
      return [];
    }
    const result = await isolateSource("daum_trend", () => fetchDaumTrend(options));
    if (!result.ok) return [];
    return result.data;
  },
};

async function fetchDaumTrend(options: FetchOptions): Promise<NormalizedKeyword[]> {
  // Daum has no public keyword trend API. Stub returns empty or placeholder.
  const country = options.country ?? "KR";
  const language = options.language ?? "ko";
  const now = new Date();
  const keywords = options.keywords ?? [];
  if (keywords.length === 0) return [];
  return keywords.map((kw) => ({
    keyword: kw,
    source: "daum_trend" as const,
    country,
    language,
    collected_at: now,
    trend_score_relative: null,
    monthly_search_volume: null,
    monthly_search_volume_mobile: null,
    monthly_search_volume_pc: null,
    monthly_clicks: null,
    ctr: null,
    competition_level: null,
    cpc_low: null,
    cpc_high: null,
    rising_score: null,
    freshness_score: null,
    source_confidence: 0.2,
    raw_payload: { note: "Daum public API not available" },
  }));
}
