import type { TextareaHTMLAttributes } from "react";

export function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </div>
      ) : null}
      <textarea
        className={[
          "w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition",
          "placeholder:text-zinc-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10",
          "dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:focus:border-blue-400/40 dark:focus:ring-blue-500/20",
          className ?? "",
        ].join(" ")}
        {...rest}
      />
    </label>
  );
}

