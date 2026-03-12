"use client";

import { useState } from "react";
import type { RealtimeSectionPayload } from "@/types/realtime";
import { RealtimeKeywordList } from "./RealtimeKeywordList";

type Props = { section: RealtimeSectionPayload; highlightRanks?: Set<string> };

const ACCENT: Record<string, { ring: string; chip: string }> = {
  google: { ring: "ring-blue-500/10", chip: "bg-blue-500/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200" },
  zum: { ring: "ring-indigo-500/10", chip: "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200" },
  nate: { ring: "ring-rose-500/10", chip: "bg-rose-500/10 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200" },
  googletrend: { ring: "ring-emerald-500/10", chip: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200" },
};

function formatKoreanTime(iso: string) {
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

export function RealtimeSectionCard({ section, highlightRanks }: Props) {
  const [logoError, setLogoError] = useState(false);
  const accent = ACCENT[section.source] ?? {
    ring: "ring-zinc-500/10",
    chip: "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-400/10 dark:text-zinc-200",
  };
  return (
    <article
      className={[
        "group rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md",
        "ring-1",
        accent.ring,
        "dark:border-zinc-800 dark:bg-zinc-900/40",
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {!logoError ? (
            <img
              src={section.logoPath}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center text-[10px] text-zinc-500">
              로고
            </span>
          )}
        </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {section.title}
            </h2>
            <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              기준 {formatKoreanTime(section.updatedAt)}
            </div>
          </div>
        </div>
        <span
          className={[
            "shrink-0 rounded-full border border-zinc-200 px-2 py-1 text-[11px] font-semibold",
            "dark:border-zinc-800",
            accent.chip,
          ].join(" ")}
        >
          {section.source}
        </span>
      </div>
      <RealtimeKeywordList items={section.items} highlightRanks={highlightRanks} source={section.source} />
      {section.note && (
        <p className="mt-3 text-xs text-zinc-400">{section.note}</p>
      )}
    </article>
  );
}
