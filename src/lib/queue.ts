import { Queue, Worker, type Job } from "bullmq";

const REDIS_URL = process.env.REDIS_URL;
const connection = REDIS_URL
  ? { connection: { host: new URL(REDIS_URL).hostname, port: parseInt(new URL(REDIS_URL).port || "6379", 10), password: new URL(REDIS_URL).password || undefined } }
  : undefined;

export const KEYWORD_QUEUE_NAME = "keyword-collect";

export function getKeywordQueue(): Queue | null {
  if (!connection) return null;
  return new Queue(KEYWORD_QUEUE_NAME, connection);
}

export type KeywordJobPayload = {
  source: "google_trends" | "google_ads" | "naver_datalab" | "naver_searchad" | "daum_trend";
  jobId?: string;
  options?: Record<string, unknown>;
};

export function addKeywordJob(payload: KeywordJobPayload): Promise<string | null> {
  const queue = getKeywordQueue();
  if (!queue) return Promise.resolve(null);
  return queue.add("collect", payload, { attempts: 3, backoff: { type: "exponential", delay: 2000 } }).then((j) => j.id ?? null);
}

export function createKeywordWorker(
  processor: (job: Job<KeywordJobPayload, void, string>) => Promise<void>
): Worker<KeywordJobPayload, void, string> | null {
  if (!connection) return null;
  return new Worker(KEYWORD_QUEUE_NAME, processor, connection);
}
