import type { TrendsPayload } from "@/lib/trends/types.v2";
import { TrendCard } from "./TrendCard";
import { TrendList } from "./TrendList";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", { hour12: false });
}

function Pill(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-zinc-200/70 bg-white/60 px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-200">
      {props.children}
    </span>
  );
}

export function TrendSection(props: {
  title: string;
  payload: TrendsPayload<"google"> | TrendsPayload<"naver">;
}) {
  const { payload } = props;

  return (
    <TrendCard
      title={props.title}
      subtitle={`마지막 갱신: ${timeLabel(payload.updatedAt)}`}
      rightSlot={
        <div className="flex items-center gap-2">
          <Pill>{payload.items.length}개</Pill>
          <a
            href={payload.fetchedFrom}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-200/70 bg-white/60 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
            title="원본 데이터/출처"
          >
            출처 ↗
          </a>
        </div>
      }
    >
      {payload.note ? (
        <div className="mb-3 rounded-xl border bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
          {payload.note}
        </div>
      ) : null}

      <TrendList
        items={payload.items}
        emptyMessage="표시할 데이터가 없습니다. (출처 차단/응답 변경/환경변수 미설정일 수 있어요)"
      />
    </TrendCard>
  );
}

