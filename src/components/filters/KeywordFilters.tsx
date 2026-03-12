"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SOURCES = [
  { value: "", label: "전체" },
  { value: "google_trends", label: "Google Trends" },
  { value: "google_ads", label: "Google Ads" },
  { value: "naver_datalab", label: "Naver DataLab" },
  { value: "naver_searchad", label: "Naver Search Ad" },
];

const SORT_OPTIONS = [
  { value: "opportunity", label: "기회 점수" },
  { value: "trend", label: "트렌드" },
  { value: "volume", label: "월간 검색량" },
  { value: "rising", label: "상승률" },
];

export function KeywordFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/keywords?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-600">소스</span>
        <select
          value={searchParams.get("source") ?? ""}
          onChange={(e) => update("source", e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        >
          {SOURCES.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-600">정렬</span>
        <select
          value={searchParams.get("sort") ?? "opportunity"}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-sm text-zinc-600">국가</span>
        <input
          type="text"
          placeholder="KR"
          defaultValue={searchParams.get("country") ?? ""}
          onBlur={(e) => update("country", e.target.value.trim())}
          className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
      </label>
    </div>
  );
}
