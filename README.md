# 한국 트렌드 키워드 대시보드 (Rebuild)

Google Trends(한국)와 Naver(DataLab 기반 대체 지표)를 **한 페이지 대시보드**로 보여주는 Next.js(App Router) 프로젝트입니다.

## 핵심 페이지

- `/` — 좌측 Google Trends · 우측 Naver Trends(대체 지표)

## 데이터 출처 / 한계

### Google

- **출처**: `https://trends.google.com/trending/rss?geo=KR`
- **방식**: 공개 RSS(XML) 파싱
- **한계**: Google의 “Trending now(실시간)” 화면은 안정적인 공개 API가 보장되지 않아, 이 프로젝트는 **공개 RSS 기반(일/주기 갱신)**으로 구현합니다.

### Naver

- **과거 ‘실시간 검색어 순위’는 공식 제공이 어렵습니다.**
- DataLab 오픈API는 “주어진 키워드의 추이”를 반환하는 형태라 “전체 TOP N” 같은 순위형 실시간 목록을 만들 수 없습니다.
- 따라서 본 프로젝트의 우측 패널은 **“네이버 트렌드(대체 지표)”** 입니다.
  - `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET`가 있으면 DataLab 오픈API로 **관심 키워드(최대 5개)**의 최근 지수를 받아 정렬해 표시합니다.
  - 키가 없으면, 한계 설명/설정 안내만 표시합니다.

## 설치해야 할 패키지

- 추가 의존성: `fast-xml-parser` (Google RSS 파싱)

```bash
pnpm install
```

## 환경 변수

`.env.local` 예시:

```env
# (선택) 네이버 DataLab 오픈API (비로그인 오픈 API)
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."

# (선택) 관심 키워드 (쉼표 구분, 최대 5개)
NAVER_TRENDS_KEYWORDS="삼성,아이폰,주식,날씨,부동산"
```

## 실행 방법

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속.

## 디버깅 포인트 (어디를 고치면 되는지)

- **Google 파싱 실패/빈 목록**: `src/lib/trends/google.ts`
  - RSS XML 스키마 변경, 네트워크 차단(회사 프록시) 여부 확인
- **Naver가 비어있음**: `src/lib/trends/naver.ts`
  - 환경 변수 설정 여부
  - 401/403: 키 값 오류
  - 429: 일일 호출 한도 초과
- **API 에러 응답**: `src/app/api/trends/*/route.ts`
  - 502로 내려오면 `note`에 에러 메시지가 포함됩니다.

## 새로 추가된 주요 파일

- `src/lib/trends/google.ts`
- `src/lib/trends/naver.ts`
- `src/app/api/trends/google/route.ts`
- `src/app/api/trends/naver/route.ts`
- `src/components/trends/*`
- `src/app/page.tsx`
