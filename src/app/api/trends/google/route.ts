import { NextResponse } from "next/server";
import { fetchGoogleTrendsKR } from "@/lib/trends/google";

export const revalidate = 600;

export async function GET() {
  try {
    const payload = await fetchGoogleTrendsKR({ limit: 20 });
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        source: "google",
        items: [],
        updatedAt: new Date().toISOString(),
        fetchedFrom: "https://trends.google.com/trending?geo=KR",
        note: message,
      },
      { status: 502 }
    );
  }
}
