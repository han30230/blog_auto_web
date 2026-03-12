export type TrendSource = "google" | "naver";

export type TrendItem = {
  rank: number;
  keyword: string;
  link: string;
  source: TrendSource;
  traffic?: string;
};

export type TrendsPayload<T extends TrendSource> = {
  source: T;
  items: TrendItem[];
  updatedAt: string; // ISO
  fetchedFrom: string; // human-readable source URL
  note?: string; // limitation or fallback note
};

