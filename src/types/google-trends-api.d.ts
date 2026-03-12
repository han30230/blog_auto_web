/**
 * google-trends-api 패키지 타입 선언 (공식 @types 없음)
 */
declare module "google-trends-api" {
  interface DailyTrendsOptions {
    geo: string;
    hl?: string;
    timezone?: number;
    trendDate?: Date;
  }

  interface GoogleTrendsAPI {
    dailyTrends(options: DailyTrendsOptions, callback?: (err: Error | null, res: string) => void): Promise<string>;
    realTimeTrends(options: unknown, callback?: (err: Error | null, res: string) => void): Promise<string>;
    interestOverTime(options: unknown, callback?: (err: Error | null, res: string) => void): Promise<string>;
    interestByRegion(options: unknown, callback?: (err: Error | null, res: string) => void): Promise<string>;
    relatedQueries(options: unknown, callback?: (err: Error | null, res: string) => void): Promise<string>;
    relatedTopics(options: unknown, callback?: (err: Error | null, res: string) => void): Promise<string>;
    autoComplete(options: unknown, callback?: (err: Error | null, res: string) => void): Promise<string>;
  }

  const api: GoogleTrendsAPI;
  export default api;
}
