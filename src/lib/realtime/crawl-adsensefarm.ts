import type {
  RealtimeSectionPayload,
  RealtimeSource,
  RealtimeKeywordItem,
} from "@/types/realtime";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const CRAWL_URL = "https://adsensefarm.kr/realtime/";
const FETCH_TIMEOUT_MS = 15_000;

const SOURCE_ORDER = ["google", "zum", "nate", "googletrend"] as const;
type ActiveSource = (typeof SOURCE_ORDER)[number];

const SECTION_TITLES: Record<ActiveSource, string> = {
  google: "구글 실시간 검색어",
  zum: "줌 실시간 검색어",
  nate: "네이트 실시간 검색어",
  googletrend: "구글트렌드 실시간 검색어",
};
const LOGO_PATHS: Record<ActiveSource, string> = {
  google: "/images/realtime/google.svg",
  zum: "/images/realtime/zum.svg",
  nate: "/images/realtime/nate.svg",
  googletrend: "/images/realtime/googletrend.svg",
};

/** href에 있는 HTML 엔티티 복원 (예: &amp; → &) */
function decodeHref(href: string): string {
  return href
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function toIsoFromKstTimestamp(ts: string | undefined) {
  // ts: "YYYY-MM-DD HH:mm" (assume Asia/Seoul, UTC+9)
  if (!ts) return null;
  const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00+09:00`).toISOString();
}

function searchLink(source: ActiveSource, keyword: string) {
  const q = encodeURIComponent(keyword);
  if (source === "google") return `https://www.google.com/search?q=${q}`;
  if (source === "zum") return `https://search.zum.com/search.zum?query=${q}`;
  if (source === "nate") return `https://search.daum.net/nate?w=tot&q=${q}`;
  return `https://www.google.com/search?q=${q}`; // googletrend
}

type AdsenseFarmCache = {
  fetchedAt?: string;
  items?: Array<{
    portal: string;
    rank: number;
    keyword: string;
    timestamp?: string; // "YYYY-MM-DD HH:mm"
  }>;
};

/**
 * href URL로 소스 판별
 * - 줌: search.zum.com, zum.com
 * - 네이트: search.daum.net/nate, nate?
 * - 다음: daum.net (nate 제외)
 * - 구글트렌드: trends.google.com
 * - 구글: google.com (trends 제외)
 */
function getSourceFromHref(href: string): RealtimeSource | null {
  const h = href.toLowerCase();
  if (h.includes("search.zum.com") || (h.includes("zum.com") && h.includes("search")))
    return "zum";
  if (h.includes("search.daum.net/nate") || (h.includes("daum.net") && h.includes("nate")))
    return "nate";
  if (h.includes("daum.net")) return "daum";
  if (h.includes("trends.google.com")) return "googletrend";
  if (h.includes("google.com")) return "google";
  return null;
}

/**
 * HTML 전체에서 <a href="...">텍스트</a> 순서대로 추출하고,
 * href 도메인으로 소스별 10개씩 분류
 */
function extractLinksBySource(
  html: string
): Record<RealtimeSource, RealtimeKeywordItem[]> {
  const buckets: Record<RealtimeSource, RealtimeKeywordItem[]> = {
    google: [],
    daum: [],
    zum: [],
    nate: [],
    googletrend: [],
  };
  const re = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const rawHref = m[1];
    const href = decodeHref(rawHref);
    const rawText = m[2];
    const keyword = normalizeText(rawText.replace(/<[^>]+>/g, ""));
    if (!keyword || keyword.length > 150) continue;
    const source = getSourceFromHref(href);
    if (!source) continue;
    const list = buckets[source];
    if (list.length >= 10) continue;
    const rank = list.length + 1;
    let traffic: string | undefined;
    const trafficMatch = rawText.match(/([\d,K+]+\s*\+?)/);
    if (trafficMatch) traffic = normalizeText(trafficMatch[1]);
    list.push({
      rank,
      keyword,
      link: href || undefined,
      traffic,
    });
  }
  return buckets;
}

/**
 * adsensefarm.kr/realtime 페이지 크롤링.
 * 링크 URL 패턴(줌: search.zum.com, 네이트: search.daum.net/nate 등)으로
 * 소스별 10개씩 수집합니다.
 */
export async function crawlAdsensefarmRealtime(): Promise<RealtimeSectionPayload[] | null> {
  // 1) Prefer local crawler cache when present (best for local dev UI).
  //    `.cache/adsensefarm_latest.json` is produced by `pnpm crawl:adsensefarm:once|loop`.
  try {
    const cachePath = join(process.cwd(), ".cache", "adsensefarm_latest.json");
    const cache = JSON.parse(await readFile(cachePath, "utf-8")) as AdsenseFarmCache;
    const items = Array.isArray(cache.items) ? cache.items : [];
    if (items.length) {
      const updatedAt =
        toIsoFromKstTimestamp(items[0]?.timestamp) ?? new Date().toISOString();
      const sections: RealtimeSectionPayload[] = SOURCE_ORDER.map((source) => {
        const list = items
          .filter((x) => x.portal === source)
          .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
          .slice(0, 10)
          .map((x) => ({
            rank: x.rank,
            keyword: x.keyword,
            link: searchLink(source, x.keyword),
          }));
        return {
          source: source as RealtimeSource,
          title: SECTION_TITLES[source],
          logoPath: LOGO_PATHS[source],
          items: list,
          updatedAt,
          fetchedFrom: "local_cache:.cache/adsensefarm_latest.json",
          note: "로컬 크롤러 캐시 기반",
          fallbackUsed: list.length === 0,
        };
      });
      return sections;
    }
  } catch {
    // ignore; try direct crawl below
  }

  let html: string;
  try {
    const res = await fetch(CRAWL_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const buckets = extractLinksBySource(html);
  const updatedAt = new Date().toISOString();
  const sections: RealtimeSectionPayload[] = SOURCE_ORDER.map((source) => {
    const items = buckets[source];
    const title = SECTION_TITLES[source];
    const logoPath = LOGO_PATHS[source];
    return {
      source: source as RealtimeSource,
      title,
      logoPath,
      items,
      updatedAt,
      fetchedFrom: CRAWL_URL,
      note:
        items.length > 0
          ? "adsensefarm.kr 실시간 페이지에서 수집한 데이터입니다."
          : "해당 섹션 링크를 찾지 못했습니다.",
      fallbackUsed: items.length === 0,
    };
  });

  return sections;
}
