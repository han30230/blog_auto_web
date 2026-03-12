import Link from "next/link";

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 active:translate-y-[0.5px]";
  const variants = {
    primary:
      "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 dark:shadow-blue-600/10",
    secondary:
      "bg-zinc-900/5 text-zinc-900 hover:bg-zinc-900/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15",
    outline:
      "border border-zinc-200/80 bg-white/60 text-zinc-900 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:hover:bg-zinc-950/50",
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
