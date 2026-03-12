import type { IKeywordAdapter } from "./types";
import { googleTrendsAdapter } from "./googleTrendsAdapter";
import { googleAdsAdapter } from "./googleAdsAdapter";
import { naverDataLabAdapter } from "./naverDataLabAdapter";
import { naverSearchAdAdapter } from "./naverSearchAdAdapter";
import { naverRealtimeAdapter } from "./naverRealtimeAdapter";
import { daumTrendAdapter } from "./daumTrendAdapter";
import { isSourceEnabled } from "@/lib/config/feature-flags";

const allAdapters: IKeywordAdapter[] = [
  naverRealtimeAdapter,
  googleTrendsAdapter,
  googleAdsAdapter,
  naverDataLabAdapter,
  naverSearchAdAdapter,
  daumTrendAdapter,
];

export function getAdapter(source: string): IKeywordAdapter | null {
  const a = allAdapters.find((x) => x.source === source);
  return a && isSourceEnabled(source) ? a : null;
}

export function getEnabledAdapters(): IKeywordAdapter[] {
  return allAdapters.filter((a) => isSourceEnabled(a.source));
}

export {
  googleTrendsAdapter,
  googleAdsAdapter,
  naverDataLabAdapter,
  naverSearchAdAdapter,
  naverRealtimeAdapter,
  daumTrendAdapter,
};
export type { IKeywordAdapter, NormalizedKeyword, FetchOptions, SourceType } from "./types";
