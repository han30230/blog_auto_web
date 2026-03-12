export type RealtimeSource =
  | "google"
  | "daum"
  | "zum"
  | "nate"
  | "googletrend";

export type RealtimeKeywordItem = {
  rank: number;
  keyword: string;
  link?: string;
  traffic?: string;
};

export type RealtimeSectionPayload = {
  source: RealtimeSource;
  title: string;
  logoPath: string;
  items: RealtimeKeywordItem[];
  updatedAt: string;
  fetchedFrom?: string;
  note?: string;
  fallbackUsed?: boolean;
};

export type RealtimeResponse = {
  sections: RealtimeSectionPayload[];
  updatedAt: string;
};
