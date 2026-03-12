"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendCard } from "@/components/trends/TrendCard";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type NeighborCandidate = {
  id: string;
  blogUrl: string;
  nickname?: string;
  note?: string;
  status: "대기" | "요청함" | "수락" | "거절" | "보류";
  updatedAt: string;
};

const STORAGE_KEY = "neighbors.v1";

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function download(filename: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function NeighborsClient() {
  const [items, setItems] = useState<NeighborCandidate[]>([]);
  const [bulk, setBulk] = useState("");
  const [template, setTemplate] = useState(
    "안녕하세요. 글 잘 보고 갑니다! 서로이웃 신청드립니다. 앞으로도 자주 소통해요 :)"
  );

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as NeighborCandidate[];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const stats = useMemo(() => {
    const by = new Map<NeighborCandidate["status"], number>();
    for (const it of items) by.set(it.status, (by.get(it.status) ?? 0) + 1);
    return by;
  }, [items]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TrendCard
        title="서이추 관리(수동)"
        subtitle="자동 클릭/대량 요청 봇은 약관 위반 소지가 있어 구현하지 않습니다. 대신 후보/메시지/기록을 관리합니다."
        rightSlot={
          <Button
            variant="outline"
            className="rounded-full px-3 py-1 text-xs"
            onClick={() => {
              const csv = [
                "blogUrl,nickname,status,updatedAt,note",
                ...items.map((i) =>
                  [
                    JSON.stringify(i.blogUrl),
                    JSON.stringify(i.nickname ?? ""),
                    JSON.stringify(i.status),
                    JSON.stringify(i.updatedAt),
                    JSON.stringify(i.note ?? ""),
                  ].join(",")
                ),
              ].join("\n");
              download("neighbors.csv", csv);
            }}
          >
            CSV 내보내기
          </Button>
        }
      >
        <div className="space-y-3">
          <Textarea
            label="후보 블로그 URL 일괄 추가 (한 줄에 하나)"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            rows={6}
            placeholder={"https://blog.naver.com/...\nhttps://..."}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs"
              onClick={() => {
                const urls = bulk
                  .split(/\r?\n/g)
                  .map((s) => s.trim())
                  .filter(Boolean);
                if (urls.length === 0) return;
                const next: NeighborCandidate[] = [
                  ...items,
                  ...urls.map((u) => ({
                    id: uid(),
                    blogUrl: u,
                    status: "대기" as const,
                    updatedAt: nowIso(),
                  })),
                ];
                setItems(next);
                setBulk("");
              }}
            >
              후보 추가
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-3 py-1 text-xs"
              onClick={() => setItems([])}
            >
              전체 비우기
            </Button>
          </div>

          <Textarea
            label="신청 메시지 템플릿(복사용)"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={4}
          />
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            상태 집계: 대기 {stats.get("대기") ?? 0} · 요청함 {stats.get("요청함") ?? 0} ·
            수락 {stats.get("수락") ?? 0} · 거절 {stats.get("거절") ?? 0} · 보류{" "}
            {stats.get("보류") ?? 0}
          </div>
        </div>
      </TrendCard>

      <TrendCard title="후보 목록" subtitle="각 항목을 클릭해 블로그로 이동하고 상태를 기록하세요.">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            아직 후보가 없습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200/70 bg-white/60 p-3 shadow-sm transition hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <a
                    href={it.blogUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                    title={it.blogUrl}
                  >
                    {it.blogUrl}
                  </a>
                  <select
                    value={it.status}
                    onChange={(e) => {
                      const status = e.target.value as NeighborCandidate["status"];
                      setItems((prev) =>
                        prev.map((p) =>
                          p.id === it.id ? { ...p, status, updatedAt: nowIso() } : p
                        )
                      );
                    }}
                    className="rounded-lg border border-zinc-200/80 bg-white/70 px-2 py-1 text-xs font-semibold text-zinc-900 shadow-sm outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:focus:border-blue-400/40 dark:focus:ring-blue-500/20"
                  >
                    <option value="대기">대기</option>
                    <option value="요청함">요청함</option>
                    <option value="수락">수락</option>
                    <option value="거절">거절</option>
                    <option value="보류">보류</option>
                  </select>
                </div>
                <Textarea
                  label="메모"
                  value={it.note ?? ""}
                  onChange={(e) => {
                    const note = e.target.value;
                    setItems((prev) =>
                      prev.map((p) =>
                        p.id === it.id ? { ...p, note, updatedAt: nowIso() } : p
                      )
                    );
                  }}
                  rows={2}
                  placeholder="예: 콘텐츠 주제/응답 속도/관심사"
                />
                <div className="text-[11px] text-zinc-500 dark:text-zinc-500">
                  업데이트: {new Date(it.updatedAt).toLocaleString("ko-KR", { hour12: false })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </TrendCard>
    </div>
  );
}

