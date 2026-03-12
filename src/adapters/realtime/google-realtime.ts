import type { RealtimeSectionPayload, RealtimeKeywordItem } from "@/types/realtime";
import { getMockSection } from "@/lib/realtime/mock-data";
import { fetchGoogleTrendsKR } from "@/lib/trends/google";

const TITLE = "구글 실시간 검색어";
const LOGO_PATH = "/images/realtime/google.png";

function toRealtimeItems(
  items: { rank: number; keyword: string; link?: string; traffic?: string }[]
): RealtimeKeywordItem[] {
  return items.slice(0, 10).map((it) => ({
    rank: it.rank,
    keyword: it.keyword,
    link: it.link,
    traffic: it.traffic,
  }));
}

export async function fetchGoogleRealtime(): Promise<RealtimeSectionPayload> {
  if (process.env.USE_MOCK_REALTIME === "true") {
    const { items, updatedAt } = getMockSection("google", TITLE, LOGO_PATH);
    return {
      source: "google",
      title: TITLE,
      logoPath: LOGO_PATH,
      items,
      updatedAt,
      note: "공식 실시간 API 부재로 모의 데이터 사용",
      fallbackUsed: true,
    };
  }

  try {
    const payload = await fetchGoogleTrendsKR({ limit: 10 });
    const items = toRealtimeItems(
      payload.items.map((it) => ({
        rank: it.rank,
        keyword: it.keyword,
        link: it.link,
        traffic: it.traffic,
      }))
    );
    return {
      source: "google",
      title: TITLE,
      logoPath: LOGO_PATH,
      items: items.length >= 10 ? items : [...items, ...getMockSection("google", TITLE, LOGO_PATH).items.slice(items.length, 10)],
      updatedAt: payload.updatedAt,
      fetchedFrom: payload.fetchedFrom,
      note: payload.note,
      fallbackUsed: false,
    };
  } catch {
    const { items, updatedAt } = getMockSection("google", TITLE, LOGO_PATH);
    return {
      source: "google",
      title: TITLE,
      logoPath: LOGO_PATH,
      items,
      updatedAt,
      note: "공식 실시간 API 부재로 대체 데이터/모의 데이터 사용",
      fallbackUsed: true,
    };
  }
}
