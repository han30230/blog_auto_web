import { NextResponse } from "next/server";
import { fetchNaverTrendsAlternative } from "@/lib/trends/naver";

export const revalidate = 600;

export async function GET() {
  try {
    const payload = await fetchNaverTrendsAlternative();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        source: "naver",
        items: [],
        updatedAt: new Date().toISOString(),
        fetchedFrom: "https://datalab.naver.com/keyword/trendSearch.naver",
        note: message,
      },
      { status: 502 }
    );
  }
}
