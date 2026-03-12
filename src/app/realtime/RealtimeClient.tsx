"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeResponse, RealtimeSectionPayload } from "@/types/realtime";
import { RealtimeSectionCard } from "@/components/realtime/RealtimeSectionCard";

type Props = {
  initial: RealtimeResponse | null;
};

type HighlightMap = Record<string, Set<string>>;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function keyFor(source: string, rank: number) {
  return `${source}::${rank}`;
}

function computeHighlights(prev: RealtimeSectionPayload[], next: RealtimeSectionPayload[]) {
  const prevMap = new Map<string, string>(); // source::rank -> keyword
  for (const s of prev) {
    for (const it of s.items ?? []) prevMap.set(keyFor(s.source, it.rank), it.keyword);
  }
  const hl: HighlightMap = {};
  for (const s of next) {
    for (const it of s.items ?? []) {
      const k = keyFor(s.source, it.rank);
      const before = prevMap.get(k);
      if (!before || before !== it.keyword) {
        if (!hl[s.source]) hl[s.source] = new Set<string>();
        hl[s.source].add(String(it.rank));
      }
    }
  }
  return hl;
}

async function fetchRealtime(signal?: AbortSignal): Promise<RealtimeResponse> {
  const res = await fetch("/api/realtime", { cache: "no-store", signal });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return (await res.json()) as RealtimeResponse;
}

function formatKoreanTime(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function RealtimeClient({ initial }: Props) {
  const [data, setData] = useState<RealtimeResponse | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(0); // 0 = off
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<HighlightMap>({});
  const prevSectionsRef = useRef<RealtimeSectionPayload[] | null>(initial?.sections ?? null);

  const visibleSections = useMemo(() => {
    const sections = data?.sections ?? [];
    return sections.filter((s) => (s.items?.length ?? 0) > 0);
  }, [data]);

  async function refreshOnce() {
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    try {
      const next = await fetchRealtime(ctrl.signal);
      const prev = prevSectionsRef.current ?? [];
      const hl = computeHighlights(prev, next.sections ?? []);
      setHighlights(hl);
      setData(next);
      prevSectionsRef.current = next.sections ?? [];

      // fade highlights after a bit
      void (async () => {
        await sleep(5500);
        setHighlights({});
      })();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoRefreshSec <= 0) return;
    const id = window.setInterval(() => {
      void refreshOnce();
    }, autoRefreshSec * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshSec]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            기준 {formatKoreanTime(data?.updatedAt)}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            자동 새로고침을 켜두면 변경된 키워드가 잠시 강조 표시됩니다.
          </div>
          {error ? (
            <div className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={autoRefreshSec}
            onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100"
            aria-label="자동 새로고침 주기"
          >
            <option value={0}>자동 새로고침: 꺼짐</option>
            <option value={30}>자동 새로고침: 30초</option>
            <option value={60}>자동 새로고침: 60초</option>
          </select>
          <button
            onClick={() => void refreshOnce()}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900"
            disabled={loading}
          >
            {loading ? "갱신 중…" : "새로고침"}
          </button>
        </div>
      </div>

      {visibleSections.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white/70 p-4 text-center text-sm text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          표시할 데이터가 없습니다. 먼저 `pnpm crawl:adsensefarm:once`를 실행해 주세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleSections.map((section) => (
            <RealtimeSectionCard
              key={section.source}
              section={section}
              highlightRanks={highlights[section.source]}
            />
          ))}
        </div>
      )}
    </>
  );
}

