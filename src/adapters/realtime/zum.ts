import type { RealtimeSectionPayload } from "@/types/realtime";
import { getMockSection } from "@/lib/realtime/mock-data";

const TITLE = "줌 실시간 검색어";
const LOGO_PATH = "/images/realtime/zum.png";

export async function fetchZumRealtime(): Promise<RealtimeSectionPayload> {
  if (process.env.USE_MOCK_REALTIME === "true") {
    const { items, updatedAt } = getMockSection("zum", TITLE, LOGO_PATH);
    return {
      source: "zum",
      title: TITLE,
      logoPath: LOGO_PATH,
      items,
      updatedAt,
      note: "공식 실시간 API 부재로 모의 데이터 사용",
      fallbackUsed: true,
    };
  }
  const { items, updatedAt } = getMockSection("zum", TITLE, LOGO_PATH);
  return {
    source: "zum",
    title: TITLE,
    logoPath: LOGO_PATH,
    items,
    updatedAt,
    note: "공식 실시간 API 부재로 대체 데이터/모의 데이터 사용",
    fallbackUsed: true,
  };
}
