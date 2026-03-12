"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/realtime", label: "실시간 검색어" },
  { href: "/trends", label: "트렌드" },
  { href: "/blog", label: "블로그" },
  { href: "/youtube", label: "유튜브" },
  { href: "/neighbors", label: "서이추" },
] as const;

export function TopNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2">
      {navItems.map((it) => {
        const active =
          it.href === "/realtime"
            ? pathname === "/realtime" || pathname === "/"
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={[
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              "backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
              active
                ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200"
                : "border-zinc-200 bg-white/60 text-zinc-800 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-900",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

