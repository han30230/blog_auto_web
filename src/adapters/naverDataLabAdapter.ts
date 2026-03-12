import type { IKeywordAdapter, NormalizedKeyword, FetchOptions } from "./types";
import { withRateLimit, withRetry, isolateSource } from "./base";

const NAVER_DATALAB_ENDPOINT = "https://openapi.naver.com/v1/datalab/search";

export const naverDataLabAdapter: IKeywordAdapter = {
  source: "naver_datalab",

  async fetchKeywords(options: FetchOptions): Promise<NormalizedKeyword[]> {
    const result = await isolateSource(
      "naver_datalab",
      () =>
        withRateLimit("naver_datalab", () =>
          withRetry(() => fetchNaverDataLab(options))
        )
    );
    if (!result.ok) throw new Error(result.error);
    return result.data;
  },
};

async function fetchNaverDataLab(options: FetchOptions): Promise<NormalizedKeyword[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const keywords = options.keywords?.length ? options.keywords.slice(0, 5) : ["블로그", "키워드", "검색"];
  const now = new Date();
  const country = options.country ?? "KR";
  const language = options.language ?? "ko";

  if (!clientId || !clientSecret) {
    return keywords.map((kw, i) => ({
      keyword: kw,
      source: "naver_datalab" as const,
      country,
      language,
      collected_at: now,
      trend_score_relative: 30 + Math.random() * 70,
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
      source_confidence: 0.5,
      raw_payload: { device: "all", ratio: 0.5 },
    }));
  }

  const body = {
    startDate: (options.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
    endDate: (options.endDate ?? now).toISOString().slice(0, 10),
    timeUnit: "date",
    keywordGroups: keywords.map((keyword) => ({ groupName: keyword, keywords: [keyword] })),
  };

  const res = await fetch(NAVER_DATALAB_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Naver DataLab API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    results?: Array<{ title: string; data: Array<{ period: string; ratio: string }> }>;
  };
  const results = data.results ?? [];
  return results.map((r, i) => {
    const ratio = r.data?.length ? parseFloat(r.data[r.data.length - 1].ratio ?? "0") : 50;
    return {
      keyword: r.title ?? keywords[i] ?? "unknown",
      source: "naver_datalab" as const,
      country,
      language,
      collected_at: now,
      trend_score_relative: ratio,
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
      source_confidence: 0.9,
      raw_payload: { results: r },
    };
  });
}
