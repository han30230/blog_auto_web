import { fetchGoogleTrendsKR } from "@/lib/trends/google";
import { YoutubeClient } from "./YoutubeClient";

export const dynamic = "force-dynamic";

export default async function YoutubePage() {
  const google = await fetchGoogleTrendsKR({ limit: 1 }).catch(() => null);
  const defaultKeyword = google?.items?.[0]?.keyword ?? "키워드";

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-200">
          🎬 제작 템플릿
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          유튜브 영상 만들기
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          키워드 기반으로 제목/훅/대본/샷 리스트/해시태그를 생성합니다.
        </p>
      </header>

      <YoutubeClient defaultKeyword={defaultKeyword} />
    </div>
  );
}

