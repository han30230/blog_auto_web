import { NextResponse } from "next/server";
import { fetchAllRealtimeSections } from "@/adapters/realtime";
import { getMockSection } from "@/lib/realtime/mock-data";
import type { RealtimeResponse } from "@/types/realtime";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const TITLES: Record<string, string> = {
  google: "구글 실시간 검색어",
  zum: "줌 실시간 검색어",
  nate: "네이트 실시간 검색어",
  googletrend: "구글트렌드 실시간 검색어",
};
const LOGO_PATHS: Record<string, string> = {
  google: "/images/realtime/google.svg",
  zum: "/images/realtime/zum.svg",
  nate: "/images/realtime/nate.svg",
  googletrend: "/images/realtime/googletrend.svg",
};
const SOURCE_ORDER = ["google", "zum", "nate", "googletrend"] as const;

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdsenseFarmCache = {
  fetchedAt?: string;
  items?: Array<{
    portal: string;
    rank: number;
    keyword: string;
    timestamp?: string; // "YYYY-MM-DD HH:mm" (site time)
  }>;
};

function toIsoFromKstTimestamp(ts: string | undefined) {
  // ts: "YYYY-MM-DD HH:mm" (assume Asia/Seoul, UTC+9)
  if (!ts) return null;
  const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00+09:00`).toISOString();
}

function searchLink(source: (typeof SOURCE_ORDER)[number], keyword: string) {
  const q = encodeURIComponent(keyword);
  if (source === "google") return `https://www.google.com/search?q=${q}`;
  if (source === "zum") return `https://search.zum.com/search.zum?query=${q}`;
  if (source === "nate") return `https://search.daum.net/nate?w=tot&q=${q}`;
  return `https://www.google.com/search?q=${q}`; // googletrend
}

async function tryAdsenseFarmCache(): Promise<RealtimeResponse | null> {
  const path = join(process.cwd(), ".cache", "adsensefarm_latest.json");
  let raw: AdsenseFarmCache | null = null;
  try {
    raw = JSON.parse(await readFile(path, "utf-8")) as AdsenseFarmCache;
  } catch {
    return null;
  }

  const items = Array.isArray(raw.items) ? raw.items : [];
  if (!items.length) return null;

  const updatedAtIso = toIsoFromKstTimestamp(items[0]?.timestamp) ?? new Date().toISOString();

  const sections = SOURCE_ORDER.map((source) => {
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
      source,
      title: TITLES[source],
      logoPath: LOGO_PATHS[source],
      items: list,
      updatedAt: updatedAtIso,
      fetchedFrom: "https://adsensefarm.kr/realtime/{section}.php",
      note: "로컬 크롤러(.cache/adsensefarm_latest.json) 기반",
      fallbackUsed: false,
    };
  });

  return { sections, updatedAt: updatedAtIso };
}

function fallbackResponse(): RealtimeResponse {
  const updatedAt = new Date().toISOString();
  const sections = SOURCE_ORDER.map((source) => {
    const { items, updatedAt: sectionUpdated } = getMockSection(
      source,
      TITLES[source],
      LOGO_PATHS[source]
    );
    return {
      source,
      title: TITLES[source],
      logoPath: LOGO_PATHS[source],
      items,
      updatedAt: sectionUpdated,
      note: "공식 실시간 API 부재로 대체 데이터/모의 데이터 사용",
      fallbackUsed: true,
    };
  });
  return { sections, updatedAt };
}

export async function GET() {
  try {
    const cached = await tryAdsenseFarmCache();
    if (cached) return NextResponse.json(cached);

    const data = await fetchAllRealtimeSections();
    return NextResponse.json(data);
  } catch {
    const data = fallbackResponse();
    return NextResponse.json(data);
  }
}
