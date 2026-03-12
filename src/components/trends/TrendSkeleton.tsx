export function TrendSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border bg-white/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/30"
        >
          <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-900/10 dark:bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/5 animate-pulse rounded bg-zinc-900/10 dark:bg-white/10" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-zinc-900/10 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

