import type { TrendsPayload, TrendItem } from "./types.v2";

const NAVER_DATALAB_TREND_UI =
  "https://datalab.naver.com/keyword/trendSearch.naver";

type NaverEnv = {
  clientId?: string;
  clientSecret?: string;
};

function getNaverEnv(): NaverEnv {
  return {
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
  };
}

function todayYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgoYYYYMMDD(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toNaverSearchLink(q: string): string {
  const url = new URL("https://search.naver.com/search.naver");
  url.searchParams.set("query", q);
  return url.toString();
}

/**
 * Naver는 과거 '실시간 검색어 순위'를 공식적으로 제공하지 않습니다.
 * 또한 DataLab의 공개 오픈API는 '주어진 키워드의 추이'를 돌려주는 형태라
 * "전체 실시간 TOP N" 같은 순위형 목록을 만들 수 없습니다.
 *
 * 따라서 이 구현은 "대체 지표"입니다:
 * - 관심 키워드(최대 5개)의 최근 7일 검색량 지수(0~100) 중 '마지막 값'을 점수로 사용
 * - 점수 내림차순으로 1~N 랭킹을 표시
 *
 * 디버깅 포인트:
 * - 401/403: NAVER_CLIENT_ID/SECRET 확인
 * - 429: 일일 호출 한도(1,000회) 초과
 * - items가 비어있음: keywords 설정/응답 스키마 변경 확인
 */
export async function fetchNaverTrendsAlternative(params?: {
  keywords?: string[];
}): Promise<TrendsPayload<"naver">> {
  const updatedAt = new Date().toISOString();
  const { clientId, clientSecret } = getNaverEnv();

  const configured =
    params?.keywords ??
    (process.env.NAVER_TRENDS_KEYWORDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const keywords = configured.slice(0, 5);

  if (!clientId || !clientSecret) {
    return {
      source: "naver",
      items: [],
      updatedAt,
      fetchedFrom: NAVER_DATALAB_TREND_UI,
      note:
        "네이버는 과거 ‘실시간 검색어 순위’(전체 TOP N)를 공식 제공하지 않습니다. 현재 공개 오픈API는 ‘지정한 키워드의 추이’ 형태입니다. NAVER_CLIENT_ID/SECRET을 설정하면 ‘관심 키워드 트렌드(대체 지표)’를 표시합니다.",
    };
  }

  if (keywords.length === 0) {
    return {
      source: "naver",
      items: [],
      updatedAt,
      fetchedFrom: NAVER_DATALAB_TREND_UI,
      note:
        "NAVER_TRENDS_KEYWORDS(쉼표 구분, 최대 5개)를 설정하면 관심 키워드 기준으로 대체 랭킹을 표시합니다.",
    };
  }

  const startDate = daysAgoYYYYMMDD(7);
  const endDate = todayYYYYMMDD();

  const body = {
    startDate,
    endDate,
    timeUnit: "date",
    keywordGroups: keywords.map((k) => ({ groupName: k, keywords: [k] })),
  };

  const res = await fetch("https://openapi.naver.com/v1/datalab/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    body: JSON.stringify(body),
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Naver DataLab OpenAPI failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    results?: Array<{
      title?: string;
      data?: Array<{ period?: string; ratio?: number }>;
    }>;
  };

  const mapped: Array<(TrendItem & { score: number }) | null> = (json.results ?? []).map(
    (r) => {
    const keyword = r.title?.trim();
    if (!keyword) return null;
    const data = r.data ?? [];
    const last = data[data.length - 1]?.ratio;
    const score = typeof last === "number" ? last : 0;
    const item = {
      rank: 0,
      keyword,
      link: toNaverSearchLink(keyword),
      source: "naver" as const,
      traffic: `지수 ${score.toFixed(1)}`,
      score,
    } satisfies TrendItem & { score: number };
    return item;
  }
  );

  const items: Array<TrendItem & { score: number }> = mapped
    .filter((v): v is TrendItem & { score: number } => v !== null)
    .sort((a, b) => b.score - a.score)
    .map((it, idx) => ({ ...it, rank: idx + 1 }));

  return {
    source: "naver",
    items,
    updatedAt,
    fetchedFrom: "https://openapi.naver.com/v1/datalab/search",
    note:
      "대체 지표: 네이버 DataLab 오픈API는 '관심 키워드의 추이'만 제공하므로, 최근 7일 중 마지막 지수(ratio)를 점수로 정렬해 표시합니다(전체 실시간 TOP N 아님).",
  };
}

