"use client";

import { useMemo, useState } from "react";
import { TrendCard } from "@/components/trends/TrendCard";
import { Textarea } from "@/components/ui/Textarea";
import {
  buildYoutubeScript,
  type YoutubeDraftInput,
} from "@/lib/writing/templates";
import { Button } from "@/components/ui/Button";

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function YoutubeClient(props: { defaultKeyword: string }) {
  const [keyword, setKeyword] = useState(props.defaultKeyword);
  const [target, setTarget] = useState("입문자/일반 시청자");
  const [format, setFormat] = useState<YoutubeDraftInput["format"]>("롱폼");
  const [tone, setTone] = useState<YoutubeDraftInput["tone"]>("해설형");
  const [copied, setCopied] = useState(false);

  const draft = useMemo(
    () =>
      buildYoutubeScript({
        keyword: keyword.trim() || "키워드",
        target,
        format,
        tone,
      }),
    [keyword, target, format, tone]
  );

  const bundle = useMemo(() => {
    return [
      `제목 아이디어:`,
      ...draft.titleIdeas.map((t) => `- ${t}`),
      ``,
      `훅:`,
      draft.hook,
      ``,
      `대본:`,
      draft.script,
      ``,
      `샷 리스트:`,
      ...draft.shotList.map((s) => `- ${s}`),
      ``,
      `설명란:`,
      draft.description,
      ``,
      `해시태그:`,
      draft.hashtags.join(" "),
      ``,
    ].join("\n");
  }, [draft]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TrendCard
        title="입력"
        subtitle="키워드 기반으로 제목/훅/대본/샷 리스트를 생성합니다."
        rightSlot={
          <Button
            variant="outline"
            className="rounded-full px-3 py-1 text-xs"
            onClick={async () => {
              await copyToClipboard(bundle);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "복사됨" : "전체 복사"}
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
              placeholder="예: 맞춤형복지"
            />
          </label>

          <Textarea
            label="타깃 시청자"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                포맷
              </div>
              <select
                value={format ?? "롱폼"}
                onChange={(e) => setFormat(e.target.value as YoutubeDraftInput["format"])}
                className="w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:focus:border-blue-400/40 dark:focus:ring-blue-500/20"
              >
                <option value="롱폼">롱폼</option>
                <option value="쇼츠">쇼츠</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                톤
              </div>
              <select
                value={tone ?? "해설형"}
                onChange={(e) => setTone(e.target.value as YoutubeDraftInput["tone"])}
                className="w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-100 dark:focus:border-blue-400/40 dark:focus:ring-blue-500/20"
              >
                <option value="해설형">해설형</option>
                <option value="리뷰형">리뷰형</option>
                <option value="빠르게">빠르게</option>
                <option value="차분하게">차분하게</option>
              </select>
            </label>
          </div>
        </div>
      </TrendCard>

      <TrendCard title="출력" subtitle="한 번에 복사해서 제작 문서로 사용하세요">
        <pre className="max-h-[70vh] whitespace-pre-wrap rounded-xl border border-zinc-200/70 bg-zinc-50 p-3 text-xs text-zinc-800 shadow-inner dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-100">
          {bundle}
        </pre>
      </TrendCard>
    </div>
  );
}

