"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

const SOURCES = [
  "google_trends",
  "google_ads",
  "naver_datalab",
  "naver_searchad",
  "daum_trend",
] as const;

export function JobsList({ initialJobs }: { initialJobs: Record<string, unknown>[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);

  async function runJob(source: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const json = await res.json();
      if (json.data?.job) {
        setJobs((prev) => [json.data.job, ...prev]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-semibold">새 수집 실행</h2>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((source) => (
            <button
              key={source}
              disabled={loading}
              onClick={() => runJob(source)}
              className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {source}
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold">작업 목록</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="pb-2 pr-4">소스</th>
                <th className="pb-2 pr-4">상태</th>
                <th className="pb-2 pr-4">시작</th>
                <th className="pb-2 pr-4">종료</th>
                <th className="pb-2">에러</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j: Record<string, unknown>) => (
                <tr key={String(j.id)} className="border-b border-zinc-100 dark:border-zinc-700">
                  <td className="py-2 pr-4">{String(j.source)}</td>
                  <td className="py-2 pr-4">{String(j.status)}</td>
                  <td className="py-2 pr-4">
                    {j.startedAt ? new Date(String(j.startedAt)).toLocaleString("ko-KR") : "-"}
                  </td>
                  <td className="py-2 pr-4">
                    {j.finishedAt ? new Date(String(j.finishedAt)).toLocaleString("ko-KR") : "-"}
                  </td>
                  <td className="py-2 text-red-600">{j.errorMessage ? String(j.errorMessage) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
