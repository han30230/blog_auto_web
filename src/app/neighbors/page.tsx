import { NeighborsClient } from "./NeighborsClient";

export const dynamic = "force-dynamic";

export default function NeighborsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/60 px-3 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-200">
          🤝 후보/상태 관리
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          서이추 관리
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          자동화 대신 후보를 관리하고, 메시지 템플릿/상태 기록을 남기는 방식입니다.
        </p>
      </header>

      <NeighborsClient />
    </div>
  );
}

