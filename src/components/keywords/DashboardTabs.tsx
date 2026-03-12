"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { KeywordTable } from "./KeywordTable";
import Link from "next/link";

type TabId = "naver_realtime" | "google_trends";

const TABS: { id: TabId; label: string }[] = [
  { id: "naver_realtime", label: "네이버 실시간 검색어" },
  { id: "google_trends", label: "구글 트렌드" },
];

function filterByTab(keywords: Record<string, unknown>[], tab: TabId) {
  const bySource = keywords.filter((k) => String(k.source ?? "") === tab);
  return bySource.slice(0, 50);
}

export function DashboardTabs({ keywords }: { keywords: Record<string, unknown>[] }) {
  const [tab, setTab] = useState<TabId>("naver_realtime");
  const filtered = filterByTab(keywords, tab);
  const rows = filtered.map((k) => ({
    id: String(k.id),
    text: String(k.text ?? ""),
    country: String(k.country ?? "KR"),
    language: String(k.language ?? "ko"),
    source: k.source as string | null,
    trendScoreRelative: k.trendScoreRelative as number | null,
    monthlySearchVolume: k.monthlySearchVolume as number | null,
    risingScore: k.risingScore as number | null,
    competitionLevel: k.competitionLevel as number | null,
    finalOpportunityScore: k.finalOpportunityScore as number | null,
    collectedAt: k.collectedAt as string | null,
  }));

  return (
    <Card>
      <div className="mb-4 flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <KeywordTable rows={rows} />
      <p className="mt-4 text-sm text-zinc-500">
        <Link href="/keywords" className="text-blue-600 hover:underline">
          전체 키워드 보기
        </Link>
      </p>
    </Card>
  );
}
