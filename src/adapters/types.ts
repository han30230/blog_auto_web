export type SourceType =
  | "google_trends"
  | "google_ads"
  | "naver_datalab"
  | "naver_searchad"
  | "naver_realtime"
  | "daum_trend"
  | "bing";

export interface NormalizedKeyword {
  keyword: string;
  source: SourceType;
  country: string;
  language: string;
  collected_at: Date;
  trend_score_relative?: number | null;
  monthly_search_volume?: number | null;
  monthly_search_volume_mobile?: number | null;
  monthly_search_volume_pc?: number | null;
  monthly_clicks?: number | null;
  ctr?: number | null;
  competition_level?: number | null;
  cpc_low?: number | null;
  cpc_high?: number | null;
  rising_score?: number | null;
  freshness_score?: number | null;
  source_confidence?: number | null;
  raw_payload?: Record<string, unknown> | null;
}

export interface FetchOptions {
  keywords?: string[];
  country?: string;
  language?: string;
  startDate?: Date;
  endDate?: Date;
  options?: Record<string, unknown>;
}

export interface IKeywordAdapter {
  readonly source: SourceType;
  fetchKeywords(options: FetchOptions): Promise<NormalizedKeyword[]>;
}
