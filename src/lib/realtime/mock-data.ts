import type { RealtimeKeywordItem, RealtimeSource } from "@/types/realtime";

const MOCK_KEYWORDS: Record<RealtimeSource, RealtimeKeywordItem[]> = {
  google: [
    { rank: 1, keyword: "날씨", link: "https://www.google.com/search?q=날씨" },
    { rank: 2, keyword: "주식", link: "https://www.google.com/search?q=주식" },
    { rank: 3, keyword: "부동산", link: "https://www.google.com/search?q=부동산" },
    { rank: 4, keyword: "맛집", link: "https://www.google.com/search?q=맛집" },
    { rank: 5, keyword: "영화", link: "https://www.google.com/search?q=영화" },
    { rank: 6, keyword: "쇼핑", link: "https://www.google.com/search?q=쇼핑" },
    { rank: 7, keyword: "뉴스", link: "https://www.google.com/search?q=뉴스" },
    { rank: 8, keyword: "게임", link: "https://www.google.com/search?q=게임" },
    { rank: 9, keyword: "여행", link: "https://www.google.com/search?q=여행" },
    { rank: 10, keyword: "건강", link: "https://www.google.com/search?q=건강" },
  ],
  daum: [
    { rank: 1, keyword: "다음 실시간1", link: "https://daum.net" },
    { rank: 2, keyword: "다음 실시간2", link: "https://daum.net" },
    { rank: 3, keyword: "다음 실시간3", link: "https://daum.net" },
    { rank: 4, keyword: "다음 실시간4", link: "https://daum.net" },
    { rank: 5, keyword: "다음 실시간5", link: "https://daum.net" },
    { rank: 6, keyword: "다음 실시간6", link: "https://daum.net" },
    { rank: 7, keyword: "다음 실시간7", link: "https://daum.net" },
    { rank: 8, keyword: "다음 실시간8", link: "https://daum.net" },
    { rank: 9, keyword: "다음 실시간9", link: "https://daum.net" },
    { rank: 10, keyword: "다음 실시간10", link: "https://daum.net" },
  ],
  zum: [
    { rank: 1, keyword: "줌 실시간1", link: "https://zum.com" },
    { rank: 2, keyword: "줌 실시간2", link: "https://zum.com" },
    { rank: 3, keyword: "줌 실시간3", link: "https://zum.com" },
    { rank: 4, keyword: "줌 실시간4", link: "https://zum.com" },
    { rank: 5, keyword: "줌 실시간5", link: "https://zum.com" },
    { rank: 6, keyword: "줌 실시간6", link: "https://zum.com" },
    { rank: 7, keyword: "줌 실시간7", link: "https://zum.com" },
    { rank: 8, keyword: "줌 실시간8", link: "https://zum.com" },
    { rank: 9, keyword: "줌 실시간9", link: "https://zum.com" },
    { rank: 10, keyword: "줌 실시간10", link: "https://zum.com" },
  ],
  nate: [
    { rank: 1, keyword: "네이트 실시간1", link: "https://nate.com" },
    { rank: 2, keyword: "네이트 실시간2", link: "https://nate.com" },
    { rank: 3, keyword: "네이트 실시간3", link: "https://nate.com" },
    { rank: 4, keyword: "네이트 실시간4", link: "https://nate.com" },
    { rank: 5, keyword: "네이트 실시간5", link: "https://nate.com" },
    { rank: 6, keyword: "네이트 실시간6", link: "https://nate.com" },
    { rank: 7, keyword: "네이트 실시간7", link: "https://nate.com" },
    { rank: 8, keyword: "네이트 실시간8", link: "https://nate.com" },
    { rank: 9, keyword: "네이트 실시간9", link: "https://nate.com" },
    { rank: 10, keyword: "네이트 실시간10", link: "https://nate.com" },
  ],
  googletrend: [
    { rank: 1, keyword: "구글트렌드1", traffic: "100+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 2, keyword: "구글트렌드2", traffic: "500+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 3, keyword: "구글트렌드3", traffic: "1K+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 4, keyword: "구글트렌드4", traffic: "2K+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 5, keyword: "구글트렌드5", traffic: "5K+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 6, keyword: "구글트렌드6", traffic: "10K+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 7, keyword: "구글트렌드7", traffic: "20K+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 8, keyword: "구글트렌드8", traffic: "50K+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 9, keyword: "구글트렌드9", traffic: "100K+", link: "https://trends.google.com/trending?geo=KR" },
    { rank: 10, keyword: "구글트렌드10", traffic: "500K+", link: "https://trends.google.com/trending?geo=KR" },
  ],
};

export function getMockSection(
  source: RealtimeSource,
  title: string,
  logoPath: string
): { items: RealtimeKeywordItem[]; updatedAt: string } {
  // In production (e.g. Vercel), showing placeholder "실시간1/2/3" is misleading.
  // Only return mock keywords when USE_MOCK_REALTIME is explicitly enabled.
  const allowMock = process.env.USE_MOCK_REALTIME === "true";
  if (!allowMock && process.env.NODE_ENV === "production") {
    return { items: [], updatedAt: new Date().toISOString() };
  }
  const items = MOCK_KEYWORDS[source].slice(0, 10);
  return {
    items,
    updatedAt: new Date().toISOString(),
  };
}

export function getMockItems(source: RealtimeSource): RealtimeKeywordItem[] {
  const allowMock = process.env.USE_MOCK_REALTIME === "true";
  if (!allowMock && process.env.NODE_ENV === "production") return [];
  return MOCK_KEYWORDS[source].slice(0, 10);
}
