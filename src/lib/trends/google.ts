import { XMLParser } from "fast-xml-parser";
import type { TrendsPayload, TrendItem } from "./types.v2";

const GOOGLE_TRENDS_RSS_KR = "https://trends.google.com/trending/rss?geo=KR";

type RssItem = {
  title?: string;
  link?: string;
  "ht:approx_traffic"?: string;
};

function toArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function safeText(v: unknown): string | undefined {
  if (typeof v === "string") return v.trim() || undefined;
  return undefined;
}

export async function fetchGoogleTrendsKR(params?: {
  limit?: number;
}): Promise<TrendsPayload<"google">> {
  const limit = Math.max(1, Math.min(params?.limit ?? 20, 50));
  const updatedAt = new Date().toISOString();

  const res = await fetch(GOOGLE_TRENDS_RSS_KR, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; TrendsDashboardBot/1.0; +https://example.local)",
      Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
    },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Google Trends RSS fetch failed: HTTP ${res.status}`);
  }

  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: true,
    attributeNamePrefix: "",
    parseTagValue: false,
    trimValues: true,
  });

  const doc = parser.parse(xml) as {
    rss?: { channel?: { item?: RssItem | RssItem[] } };
  };

  const rawItems = toArray(doc?.rss?.channel?.item);
  const items: TrendItem[] = rawItems
    .map((it, idx): TrendItem | null => {
      const keyword = safeText(it.title);
      const link = safeText(it.link);
      if (!keyword || !link) return null;
      return {
        rank: idx + 1,
        keyword,
        link,
        source: "google",
        traffic: safeText(it["ht:approx_traffic"]),
      };
    })
    .filter((v): v is TrendItem => Boolean(v))
    .slice(0, limit);

  return {
    source: "google",
    items,
    updatedAt,
    fetchedFrom: GOOGLE_TRENDS_RSS_KR,
    note:
      "Google Trends는 공개 RSS를 통해 제공되는 트렌드(일/주기 갱신)를 사용합니다. 실시간 페이지(Trending now)는 안정적인 공개 API가 없어 RSS 기반으로 구성했습니다.",
  };
}

