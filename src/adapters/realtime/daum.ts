import type { RealtimeSectionPayload } from "@/types/realtime";
import { getMockSection } from "@/lib/realtime/mock-data";

const TITLE = "다음 실시간 검색어";
const LOGO_PATH = "/images/realtime/daum.png";
const USE_MOCK = process.env.USE_MOCK_REALTIME === "true";

export async function fetchDaumRealtime(): Promise<RealtimeSectionPayload> {
  if (USE_MOCK) {
    const { items, updatedAt } = getMockSection("daum", TITLE, LOGO_PATH);
    return {
      source: "daum",
      title: TITLE,
      logoPath: LOGO_PATH,
      items,
      updatedAt,
      note: "공식 실시간 API 부재로 모의 데이터 사용",
      fallbackUsed: true,
    };
  }

  try {
    // 다음 실시간 검색어 공식 API 없음. 추후 스크래핑/API 연동 시 여기 구현.
    const { items, updatedAt } = getMockSection("daum", TITLE, LOGO_PATH);
    return {
      source: "daum",
      title: TITLE,
      logoPath: LOGO_PATH,
      items,
      updatedAt,
      note: "공식 실시간 API 부재로 대체 데이터/모의 데이터 사용",
      fallbackUsed: true,
    };
  } catch {
    const { items, updatedAt } = getMockSection("daum", TITLE, LOGO_PATH);
    return {
      source: "daum",
      title: TITLE,
      logoPath: LOGO_PATH,
      items,
      updatedAt,
      note: "공식 실시간 API 부재로 대체 데이터/모의 데이터 사용",
      fallbackUsed: true,
    };
  }
}
