import { Suspense } from "react";
import { TrendSkeleton } from "@/components/trends/TrendSkeleton";
import { TrendSection } from "@/components/trends/TrendSection";
import type { TrendsPayload } from "@/lib/trends/types.v2";
import { fetchGoogleTrendsKR } from "@/lib/trends/google";
import { fetchNaverTrendsAlternative } from "@/lib/trends/naver";

export const dynamic = "force-dynamic";

async function GoogleSection() {
  let payload: TrendsPayload<"google">;
  try {
    payload = await fetchGoogleTrendsKR({ limit: 20 });
  } catch (err) {
    payload = {
      source: "google",
      items: [],
      updatedAt: new Date().toISOString(),
      fetchedFrom: "https://trends.google.com/trending?geo=KR",
      note: err instanceof Error ? err.message : "Unknown error",
    };
  }
  return <TrendSection title="Google Trends (KR)" payload={payload} />;
}

async function NaverSection() {
  let payload: TrendsPayload<"naver">;
  try {
    payload = await fetchNaverTrendsAlternative();
  } catch (err) {
    payload = {
      source: "naver",
      items: [],
      updatedAt: new Date().toISOString(),
      fetchedFrom: "https://datalab.naver.com/keyword/trendSearch.naver",
      note: err instanceof Error ? err.message : "Unknown error",
    };
  }
  return <TrendSection title="Naver Trends (대체 지표)" payload={payload} />;
}

export default function TrendsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-200">
          🔥 오늘의 트렌드
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          한국 트렌드 키워드 대시보드
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          좌측 Google · 우측 Naver(가능 범위 내 공개 데이터 기반). 5~10분 캐시로 갱신됩니다.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<TrendSkeleton />}>
          <GoogleSection />
        </Suspense>
        <Suspense fallback={<TrendSkeleton />}>
          <NaverSection />
        </Suspense>
      </div>

      <footer className="mt-8 text-xs text-zinc-500 dark:text-zinc-500">
        캐시/파싱 이슈가 생기면 `src/lib/trends/*`와 `src/app/api/trends/*`를 우선 확인하세요.
      </footer>
    </div>
  );
}
