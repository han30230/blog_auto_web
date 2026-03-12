import { fetchAllRealtimeSections } from "@/adapters/realtime";
import { RealtimePageHeader } from "@/components/realtime/RealtimePageHeader";
import { RealtimeFooter } from "@/components/realtime/RealtimeFooter";
import type { RealtimeResponse } from "@/types/realtime";
import { RealtimeClient } from "./RealtimeClient";

export const dynamic = "force-dynamic";

function formatKoreanTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default async function RealtimePage() {
  let payload: RealtimeResponse | null = null;
  let error = false;
  try {
    payload = await fetchAllRealtimeSections();
  } catch {
    error = true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <RealtimePageHeader updatedAt={payload?.updatedAt ?? null} formatTime={formatKoreanTime} />
        {error ? (
          <p className="rounded-xl border border-zinc-200 bg-white/70 p-4 text-center text-sm text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <RealtimeClient initial={payload} />
        )}
        <RealtimeFooter />
      </div>
    </div>
  );
}
