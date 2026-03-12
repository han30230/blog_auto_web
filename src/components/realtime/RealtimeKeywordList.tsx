import type { RealtimeKeywordItem } from "@/types/realtime";

type Props = { items: RealtimeKeywordItem[]; source: string; highlightRanks?: Set<string> };

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function RealtimeKeywordList({ items, highlightRanks }: Props) {
  const list = items.slice(0, 10);
  return (
    <ul className="space-y-2 text-sm">
      {list.map((item) => (
        <li
          key={`${item.rank}-${item.keyword}`}
          className={[
            "flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-950/40",
            highlightRanks?.has(String(item.rank))
              ? "bg-amber-50 ring-1 ring-amber-500/20 dark:bg-amber-500/10"
              : "",
          ].join(" ")}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[12px] font-bold text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-200">
            {item.rank}
          </span>
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-500"
            >
              {item.keyword}
            </a>
          ) : (
            <span className="flex-1 text-zinc-900 dark:text-zinc-100">{item.keyword}</span>
          )}
          {item.traffic != null && item.traffic !== "" && (
            <span className="ml-2 shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
              {item.traffic}
            </span>
          )}
          <button
            type="button"
            onClick={() => void copyToClipboard(item.keyword)}
            className="ml-1 shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label={`키워드 복사: ${item.keyword}`}
            title="복사"
          >
            복사
          </button>
        </li>
      ))}
    </ul>
  );
}
