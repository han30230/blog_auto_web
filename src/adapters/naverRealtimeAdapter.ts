import type { IKeywordAdapter, NormalizedKeyword, FetchOptions } from "./types";
import { isolateSource } from "./base";

/**
 * 네이버 실시간 검색어 순위 (비공개 JSON 엔드포인트 기반)
 * rank.search.naver.com/rank.js
 */
const RANK_URLS = ["https://rank.search.naver.com/rank.js", "http://rank.search.naver.com/rank.js"];

export const naverRealtimeAdapter: IKeywordAdapter = {
  source: "naver_realtime",

  async fetchKeywords(options: FetchOptions): Promise<NormalizedKeyword[]> {
    const result = await isolateSource("naver_realtime", () => fetchNaverRealtime(options));
    if (!result.ok) throw new Error(result.error);
    return result.data;
  },
};

interface NaverRankItem {
  rank?: number;
  keyword?: string;
  score?: number;
  change?: string;
  cvalue?: number;
  delta?: number;
  ratio?: string;
  tvalue?: number;
}

interface NaverRankResponse {
  ts?: string;
  data?: { data?: NaverRankItem[] };
}

async function fetchNaverRealtime(_options: FetchOptions): Promise<NormalizedKeyword[]> {
  const now = new Date();
  const country = _options.country ?? "KR";
  const language = _options.language ?? "ko";

  let lastError: Error | null = null;
  for (const url of RANK_URLS) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;
      const text = await res.text();
      let json: NaverRankResponse;
      try {
        json = JSON.parse(text) as NaverRankResponse;
      } catch {
        continue;
      }
      const list = json?.data?.data ?? [];
      if (list.length === 0) continue;
      return list.map((item, i) => {
        const rank = item.rank ?? i + 1;
        const score = item.score ?? item.tvalue ?? 100 - rank * 2;
        const rise = item.cvalue ?? 0;
        return {
          keyword: item.keyword ?? `키워드 ${rank}`,
          source: "naver_realtime" as const,
          country,
          language,
          collected_at: now,
          trend_score_relative: Math.min(100, score + rise / 10),
          monthly_search_volume: null,
          monthly_search_volume_mobile: null,
          monthly_search_volume_pc: null,
          monthly_clicks: null,
          ctr: null,
          competition_level: null,
          cpc_low: null,
          cpc_high: null,
          rising_score: rise,
          freshness_score: score,
          source_confidence: 0.95,
          raw_payload: {
            rank: item.rank,
            change: item.change,
            cvalue: item.cvalue,
            ts: json.ts,
          },
        };
      });
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error("Naver realtime rank: all endpoints failed");
}
