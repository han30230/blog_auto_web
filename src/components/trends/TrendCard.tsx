import type { ReactNode } from "react";

export function TrendCard(props: {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm shadow-zinc-900/5 backdrop-blur transition hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:shadow-black/20">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {props.title}
          </h2>
          {props.subtitle ? (
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              {props.subtitle}
            </p>
          ) : null}
        </div>
        {props.rightSlot ? <div className="shrink-0">{props.rightSlot}</div> : null}
      </header>
      {props.children}
    </section>
  );
}

