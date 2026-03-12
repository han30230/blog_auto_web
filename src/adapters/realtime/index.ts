import type { RealtimeResponse, RealtimeSectionPayload } from "@/types/realtime";
import { fetchGoogleRealtime } from "./google-realtime";
import { fetchZumRealtime } from "./zum";
import { fetchNateRealtime } from "./nate";
import { fetchGoogleTrendRealtime } from "./googletrend";
import { getMockSection } from "@/lib/realtime/mock-data";
import { crawlAdsensefarmRealtime } from "@/lib/realtime/crawl-adsensefarm";

const SOURCE_ORDER = ["google", "zum", "nate", "googletrend"] as const;
const TITLES: Record<(typeof SOURCE_ORDER)[number], string> = {
  google: "구글 실시간 검색어",
  zum: "줌 실시간 검색어",
  nate: "네이트 실시간 검색어",
  googletrend: "구글트렌드 실시간 검색어",
};
const LOGO_PATHS: Record<(typeof SOURCE_ORDER)[number], string> = {
  google: "/images/realtime/google.svg",
  zum: "/images/realtime/zum.svg",
  nate: "/images/realtime/nate.svg",
  googletrend: "/images/realtime/googletrend.svg",
};

const fetchers = [
  fetchGoogleRealtime,
  fetchZumRealtime,
  fetchNateRealtime,
  fetchGoogleTrendRealtime,
];

function ensureTenItems(section: RealtimeSectionPayload): RealtimeSectionPayload {
  // If we have no real items, do NOT pad with mock keywords.
  // (Prevents "날씨/주식/부동산..." placeholders showing up in UI.)
  if (section.items.length === 0) return section;
  if (section.items.length >= 10) return section;
  const mock = getMockSection(section.source, section.title, section.logoPath);
  const filled = [...section.items, ...mock.items.slice(section.items.length, 10)];
  return { ...section, items: filled };
}

export async function fetchAllRealtimeSections(): Promise<RealtimeResponse> {
  const useMock = process.env.USE_MOCK_REALTIME === "true";
  const updatedAt = new Date().toISOString();

  if (useMock) {
    const sections = SOURCE_ORDER.map((source) => {
      const { items, updatedAt: sectionUpdated } = getMockSection(
        source,
        TITLES[source],
        LOGO_PATHS[source]
      );
      return ensureTenItems({
        source,
        title: TITLES[source],
        logoPath: LOGO_PATHS[source],
        items,
        updatedAt: sectionUpdated,
        note: "공식 실시간 API 부재로 모의 데이터 사용",
        fallbackUsed: true,
      });
    });
    return { sections, updatedAt };
  }

  // adsensefarm.kr/realtime 크롤링 시도 (USE_ADSENSEFARM_CRAWL !== "false" 일 때)
  const useCrawl = process.env.USE_ADSENSEFARM_CRAWL !== "false";
  if (useCrawl) {
    try {
      const crawled = await crawlAdsensefarmRealtime();
      if (crawled && crawled.some((s) => s.items.length > 0)) {
        const sections = SOURCE_ORDER.map((source) => {
          const section = crawled.find((s) => s.source === source);
          const payload = section
            ? ensureTenItems(section)
            : ensureTenItems({
                source,
                title: TITLES[source],
                logoPath: LOGO_PATHS[source],
                items: getMockSection(source, TITLES[source], LOGO_PATHS[source]).items,
                updatedAt,
                note: "크롤링에서 해당 섹션을 가져오지 못해 모의 데이터 사용",
                fallbackUsed: true,
              });
          return payload;
        });
        return { sections, updatedAt };
      }
    } catch {
      // 크롤링 실패 시 아래 개별 fetcher로 fallback
    }
  }

  const results = await Promise.allSettled(fetchers.map((fn) => fn()));
  const sections: RealtimeSectionPayload[] = SOURCE_ORDER.map((source, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      return ensureTenItems(result.value);
    }
    const { items, updatedAt: sectionUpdated } = getMockSection(
      source,
      TITLES[source],
      LOGO_PATHS[source]
    );
    return ensureTenItems({
      source,
      title: TITLES[source],
      logoPath: LOGO_PATHS[source],
      items,
      updatedAt: sectionUpdated,
      note: "공식 실시간 API 부재로 대체 데이터/모의 데이터 사용",
      fallbackUsed: true,
    });
  });

  return { sections, updatedAt };
}
