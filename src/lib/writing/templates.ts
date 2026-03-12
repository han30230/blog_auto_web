export type BlogDraftInput = {
  keyword: string;
  audience?: string;
  tone?: "정보형" | "경험담" | "비교/리뷰" | "뉴스/이슈";
  length?: "짧게" | "보통" | "길게";
};

export function buildBlogMarkdown(input: BlogDraftInput): string {
  const keyword = input.keyword.trim();
  const audience = (input.audience ?? "일반 독자").trim();
  const tone = input.tone ?? "정보형";
  const length = input.length ?? "보통";

  const depth =
    length === "짧게" ? 4 : length === "길게" ? 9 : 6;

  const h2 = (t: string) => `\n## ${t}\n`;
  const li = (t: string) => `- ${t}\n`;

  const sections: string[] = [];
  sections.push(`# ${keyword} 정리: 지금 왜 화제일까?\n`);
  sections.push(
    `- **대상 독자**: ${audience}\n- **글 톤**: ${tone}\n- **작성일**: ${new Date().toLocaleDateString("ko-KR")}\n`
  );

  sections.push(
    h2("한 줄 요약") +
      `오늘의 키워드 **${keyword}**는 최근 관심이 급증한 주제입니다. 이 글에서는 핵심 배경과 체크포인트를 빠르게 정리합니다.\n`
  );

  sections.push(
    h2("무슨 일인지(배경)") +
      `- ${keyword}가 언급되는 맥락(이슈/사건/신제품/정책 등)을 2~3문장으로 정리하세요.\n` +
      `- 확인 가능한 출처 링크를 1~2개 붙이면 신뢰도가 올라갑니다.\n`
  );

  sections.push(
    h2("사람들이 궁금해하는 포인트") +
      Array.from({ length: depth }).map((_, i) => li(`${keyword} 관련 Q${i + 1}: (예) 가격/일정/방법/영향/대안 등`)).join("")
  );

  sections.push(
    h2("핵심 체크리스트") +
      li("사실/루머 구분: 공식 발표/보도/자료 여부") +
      li("내 상황 영향도: 비용/시간/리스크") +
      li("다음 액션: 신청/구매/설정/주의사항")
  );

  sections.push(
    h2("추천 링크(직접 넣기)") +
      li("공식 페이지:") +
      li("관련 뉴스 검색:") +
      li("커뮤니티/후기:")
  );

  sections.push(
    h2("마무리") +
      `${keyword}는 한동안 추가 업데이트가 나올 가능성이 있습니다. 새 소식이 나오면 체크리스트를 기준으로 빠르게 영향도를 판단해보세요.\n`
  );

  return sections.join("\n");
}

export type YoutubeDraftInput = {
  keyword: string;
  target?: string;
  format?: "쇼츠" | "롱폼";
  tone?: "빠르게" | "차분하게" | "리뷰형" | "해설형";
};

export function buildYoutubeScript(input: YoutubeDraftInput): {
  titleIdeas: string[];
  hook: string;
  script: string;
  shotList: string[];
  description: string;
  hashtags: string[];
} {
  const keyword = input.keyword.trim();
  const target = (input.target ?? "대중").trim();
  const format = input.format ?? "롱폼";
  const tone = input.tone ?? "해설형";

  const titleIdeas = [
    `${keyword} 한 번에 정리 (지금 왜 뜨는지)`,
    `요즘 ${keyword} 난리난 이유 3가지`,
    `${keyword} 핵심만 5분 요약`,
  ];

  const hook =
    format === "쇼츠"
      ? `지금 ${keyword}가 왜 이렇게 뜨는지, 20초 안에 핵심만 갑니다.`
      : `오늘은 ${keyword} 이슈를 ${tone} 톤으로, ${target} 기준에서 딱 필요한 것만 정리해볼게요.`;

  const script =
    format === "쇼츠"
      ? [
          `오프닝: ${hook}`,
          `포인트1: ${keyword}가 화제가 된 트리거 1개`,
          `포인트2: 사람들이 가장 많이 오해하는 부분 1개`,
          `마무리: "더 자세한 건 설명란 링크/댓글로"`,
        ].join("\n")
      : [
          `오프닝: ${hook}`,
          `1) 무슨 일? — ${keyword} 배경을 30~60초로 요약`,
          `2) 핵심 포인트 3가지 — (영향/비용/일정/방법 중 선택)`,
          `3) 체크리스트 — 시청자가 바로 할 수 있는 액션`,
          `4) Q&A — 댓글에서 많이 나올 질문 3개 선제 답변`,
          `엔딩 — 구독/좋아요/알림 + 다음 업데이트 예고`,
        ].join("\n");

  const shotList =
    format === "쇼츠"
      ? [
          `0-2s: 키워드 자막 크게 + 🔥`,
          `2-8s: 배경 한 문장 + 관련 이미지/화면 캡처`,
          `8-16s: 포인트 2개를 빠른 컷 편집`,
          `16-20s: 요약 + CTA`,
        ]
      : [
          `인트로: 얼굴/자막 + 키워드`,
          `배경: 관련 기사/공식 페이지 캡처`,
          `포인트: 도표/체크리스트 오버레이`,
          `Q&A: 댓글 형태 UI`,
          `엔딩: 다음 영상 예고`,
        ];

  const description = [
    `오늘의 키워드: ${keyword}`,
    ``,
    `이 영상은 ${target} 기준으로 ${keyword}를 ${tone} 톤으로 정리합니다.`,
    `참고 링크는 댓글/설명란에 업데이트할게요.`,
  ].join("\n");

  const hashtags = [
    `#${keyword.replace(/\s+/g, "")}`,
    "#트렌드",
    "#이슈",
    format === "쇼츠" ? "#shorts" : "#유튜브",
  ];

  return { titleIdeas, hook, script, shotList, description, hashtags };
}

