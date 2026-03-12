type Props = {
  updatedAt: string | null;
  formatTime: (iso: string) => string;
};

export function RealtimePageHeader({ updatedAt, formatTime }: Props) {
  return (
    <header className="mb-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
        실시간 인기 검색어
        {updatedAt ? (
          <span className="text-zinc-500 dark:text-zinc-400">· 기준 {formatTime(updatedAt)}</span>
        ) : null}
      </div>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        사람들이 지금 많이 찾는 키워드
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        구글 · 줌 · 네이트 · 구글트렌드 (다음 제외)
      </p>
    </header>
  );
}
