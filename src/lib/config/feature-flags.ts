export const featureFlags = {
  googleTrendsEnabled: process.env.GOOGLE_TRENDS_ENABLED !== "false",
  googleAdsEnabled: process.env.GOOGLE_ADS_ENABLED === "true",
  naverDatalabEnabled: process.env.NAVER_DATALAB_ENABLED !== "false",
  naverSearchadEnabled: process.env.NAVER_SEARCHAD_ENABLED === "true",
  /** 네이버 실시간 검색어 순위 (rank.search.naver.com) - 기본 켜짐 */
  naverRealtimeEnabled: process.env.NAVER_REALTIME_ENABLED !== "false",
  daumEnabled: process.env.DAUM_ENABLED === "true",
  bingEnabled: process.env.BING_ENABLED === "true",
};

export const ENABLED_SOURCES = [
  ...(featureFlags.naverRealtimeEnabled ? ["naver_realtime" as const] : []),
  ...(featureFlags.googleTrendsEnabled ? ["google_trends" as const] : []),
  ...(featureFlags.googleAdsEnabled ? ["google_ads" as const] : []),
  ...(featureFlags.naverDatalabEnabled ? ["naver_datalab" as const] : []),
  ...(featureFlags.naverSearchadEnabled ? ["naver_searchad" as const] : []),
  ...(featureFlags.daumEnabled ? ["daum_trend" as const] : []),
  ...(featureFlags.bingEnabled ? ["bing" as const] : []),
] as const;

export type SourceType = (typeof ENABLED_SOURCES)[number];

export function isSourceEnabled(source: string): boolean {
  return ENABLED_SOURCES.includes(source as SourceType);
}
