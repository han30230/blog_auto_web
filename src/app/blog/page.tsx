import { BlogClient } from "./BlogClient";
import { fetchGoogleTrendsKR } from "@/lib/trends/google";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const google = await fetchGoogleTrendsKR({ limit: 1 }).catch(() => null);
  const defaultKeyword = google?.items?.[0]?.keyword ?? "키워드";

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-200">
          ✍️ 초안 생성기
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          블로그 글쓰기
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          트렌드 키워드로 초안(마크다운)을 생성하고 바로 복사할 수 있습니다.
        </p>
      </header>

      <BlogClient defaultKeyword={defaultKeyword} />
    </div>
  );
}

