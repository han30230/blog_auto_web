"use client";

import Link from "next/link";

const SOURCE_LABELS: Record<string, string> = {
  naver_realtime: "네이버 실시간",
  google_trends: "구글 트렌드",
  naver_datalab: "네이버 데이터랩",
  google_ads: "구글 광고",
  naver_searchad: "네이버 검색광고",
  daum_trend: "다음 트렌드",
};

function sourceLabel(source: string | null | undefined): string {
  if (!source) return "-";
  return SOURCE_LABELS[source] ?? source;
}

interface Row {
  id: string;
  text: string;
  country: string;
  language: string;
  source?: string | null;
  trendScoreRelative?: number | null;
  monthlySearchVolume?: number | null;
  risingScore?: number | null;
  competitionLevel?: number | null;
  finalOpportunityScore?: number | null;
  collectedAt?: string | null;
}

export function KeywordTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-zinc-500">키워드가 없습니다. 수집 작업을 실행하거나 시드 데이터를 넣어주세요.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">키워드</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">소스</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">트렌드</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">월간 검색량</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">상승</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">경쟁도</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">기회점수</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="px-4 py-2">
                {r.id.startsWith("live-") ? (
                  <span className="text-zinc-800 dark:text-zinc-200">{r.text}</span>
                ) : (
                  <Link href={`/keywords/${r.id}`} className="text-blue-600 hover:underline">
                    {r.text}
                  </Link>
                )}
              </td>
              <td className="px-4 py-2 text-sm text-zinc-600">{sourceLabel(r.source)}</td>
              <td className="px-4 py-2 text-right text-sm">{r.trendScoreRelative ?? "-"}</td>
              <td className="px-4 py-2 text-right text-sm">{r.monthlySearchVolume ?? "-"}</td>
              <td className="px-4 py-2 text-right text-sm">{r.risingScore ?? "-"}</td>
              <td className="px-4 py-2 text-right text-sm">{r.competitionLevel != null ? (r.competitionLevel * 100).toFixed(0) + "%" : "-"}</td>
              <td className="px-4 py-2 text-right text-sm font-medium">
                {r.finalOpportunityScore != null ? r.finalOpportunityScore.toFixed(2) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
