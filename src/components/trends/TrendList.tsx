import type { TrendItem } from "@/lib/trends/types.v2";

function RankBadge({ rank }: { rank: number }) {
  const hot = rank <= 3;
  return (
    <span
      className={[
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums",
        hot
          ? "bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
          : "bg-zinc-900/5 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
      ].join(" ")}
      aria-label={`rank ${rank}`}
      title={`#${rank}`}
    >
      {rank}
    </span>
  );
}

export function TrendList(props: { items: TrendItem[]; emptyMessage: string }) {
  if (props.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        {props.emptyMessage}
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {props.items.map((it) => (
        <li
          key={`${it.source}-${it.rank}-${it.keyword}`}
          className="group flex items-start gap-3 rounded-xl border border-zinc-200/70 bg-white/60 p-3 transition hover:bg-white hover:shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40"
        >
          <RankBadge rank={it.rank} />
          <div className="min-w-0 flex-1">
            <a
              href={it.link}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-2 text-sm font-semibold text-zinc-900 underline-offset-4 group-hover:underline dark:text-zinc-100"
              title={it.keyword}
            >
              {it.keyword}{" "}
              {it.rank <= 5 ? (
                <span className="ml-1 align-middle text-xs" aria-hidden="true">
                  🔥
                </span>
              ) : null}
            </a>
            {it.traffic ? (
              <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {it.traffic}
              </div>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full border border-zinc-200/70 bg-white/50 px-2 py-1 text-[11px] font-semibold text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-300">
            열기
          </span>
        </li>
      ))}
    </ol>
  );
}
