import type { RealtimeSectionPayload, RealtimeKeywordItem } from "@/types/realtime";
import { getMockSection } from "@/lib/realtime/mock-data";
import { fetchGoogleTrendsKR } from "@/lib/trends/google";

const TITLE = "구글트렌드 실시간 검색어";
const LOGO_PATH = "/images/realtime/googletrend.png";

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

export async function fetchGoogleTrendRealtime(): Promise<RealtimeSectionPayload> {
  if (process.env.USE_MOCK_REALTIME === "true") {
    const { items, updatedAt } = getMockSection("googletrend", TITLE, LOGO_PATH);
    return {
      source: "googletrend",
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
    const mock = getMockSection("googletrend", TITLE, LOGO_PATH);
    const filled =
      items.length >= 10 ? items : [...items, ...mock.items.slice(items.length, 10)];
    return {
      source: "googletrend",
      title: TITLE,
      logoPath: LOGO_PATH,
      items: filled,
      updatedAt: payload.updatedAt,
      fetchedFrom: payload.fetchedFrom,
      note: payload.note,
      fallbackUsed: items.length < 10,
    };
  } catch {
    const { items, updatedAt } = getMockSection("googletrend", TITLE, LOGO_PATH);
    return {
      source: "googletrend",
      title: TITLE,
      logoPath: LOGO_PATH,
      items,
      updatedAt,
      note: "공식 실시간 API 부재로 대체 데이터/모의 데이터 사용",
      fallbackUsed: true,
    };
  }
}
