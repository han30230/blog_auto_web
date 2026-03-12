import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/ui/TopNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "한국 트렌드 키워드 대시보드",
  description: "Google Trends + Naver(DataLab 대체) 트렌드 키워드 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased app-bg">
        <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Blog Auto Web
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Trends · Writing · Video · Neighbors
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <TopNav />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
