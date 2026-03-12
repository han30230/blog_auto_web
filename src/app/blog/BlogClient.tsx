"use client";

import { useMemo, useState } from "react";
import { TrendCard } from "@/components/trends/TrendCard";
import { Textarea } from "@/components/ui/Textarea";
import { buildBlogMarkdown, type BlogDraftInput } from "@/lib/writing/templates";
import { Button } from "@/components/ui/Button";

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function BlogClient(props: { defaultKeyword: string }) {
  const [keyword, setKeyword] = useState(props.defaultKeyword);
  const [audience, setAudience] = useState("초보자/일반 독자");
  const [tone, setTone] = useState<BlogDraftInput["tone"]>("정보형");
  const [length, setLength] = useState<BlogDraftInput["length"]>("보통");
  const [copied, setCopied] = useState(false);

  const md = useMemo(
    () =>
      buildBlogMarkdown({
        keyword: keyword.trim() || "키워드",
        audience,
        tone,
        length,
      }),
    [keyword, audience, tone, length]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TrendCard
        title="입력"
        subtitle="키워드 기반으로 블로그 초안을 생성합니다."
        rightSlot={
          <Button
            variant="outline"
            className="rounded-full px-3 py-1 text-xs"
            onClick={async () => {
              await copyToClipboard(md);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "복사됨" : "Markdown 복사"}
          </Button>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              키워드
            </div>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:focus:border-blue-400/40 dark:focus:ring-blue-500/20"
              placeholder="예: 서울사이버대학교"
            />
          </label>

          <Textarea
            label="대상 독자"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                톤
              </div>
              <select
                value={tone ?? "정보형"}
                onChange={(e) => setTone(e.target.value as BlogDraftInput["tone"])}
                className="w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:focus:border-blue-400/40 dark:focus:ring-blue-500/20"
              >
                <option value="정보형">정보형</option>
                <option value="경험담">경험담</option>
                <option value="비교/리뷰">비교/리뷰</option>
                <option value="뉴스/이슈">뉴스/이슈</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                길이
              </div>
              <select
                value={length ?? "보통"}
                onChange={(e) => setLength(e.target.value as BlogDraftInput["length"])}
                className="w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:focus:border-blue-400/40 dark:focus:ring-blue-500/20"
              >
                <option value="짧게">짧게</option>
                <option value="보통">보통</option>
                <option value="길게">길게</option>
              </select>
            </label>
          </div>
        </div>
      </TrendCard>

      <TrendCard title="미리보기" subtitle="복사해서 바로 붙여넣을 수 있는 Markdown">
        <pre className="max-h-[70vh] whitespace-pre-wrap rounded-xl border border-zinc-200/70 bg-zinc-50 p-3 text-xs text-zinc-800 shadow-inner dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-100">
          {md}
        </pre>
      </TrendCard>
    </div>
  );
}

