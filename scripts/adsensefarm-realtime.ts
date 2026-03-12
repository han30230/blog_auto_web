/**
 * Adsensefarm realtime keyword crawler (Cloudflare-protected).
 *
 * Usage:
 *   pnpm crawl:adsensefarm:sniff   # open page, sniff JSON/XHR endpoints, save candidates
 *   pnpm crawl:adsensefarm:once    # fetch once (prefer saved endpoint), write latest output
 *   pnpm crawl:adsensefarm:loop    # run periodically (5~10 min jitter), detect changes
 *
 * Notes:
 * - This script intentionally does NOT hardcode an API path. It first sniffs network responses
 *   and stores likely candidates into `.cache/adsensefarm_endpoints.json`.
 * - Normalization is heuristic. Once you see the raw JSON shape, we can harden `normalize()`.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium, type BrowserContext, type Page, type Response } from "playwright";

const TARGET_URL = "https://adsensefarm.kr/realtime/";
const CACHE_DIR = join(process.cwd(), ".cache");
const ENDPOINTS_FILE = join(CACHE_DIR, "adsensefarm_endpoints.json");
const LATEST_FILE = join(CACHE_DIR, "adsensefarm_latest.json");

type EndpointCandidate = {
  url: string;
  status: number;
  contentType: string | null;
  sample: string; // truncated body sample
  seenAt: string;
};

type ScriptHint = {
  scriptUrl: string;
  extractedUrls: string[];
  seenAt: string;
};

type RealtimeItem = {
  portal: string;
  rank: number;
  keyword: string;
  change?: string;
  timestamp: string;
  raw?: unknown;
};

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function nowTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function readJsonFile<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

function writeJsonFile(path: string, data: unknown) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

function looksLikeKeywordJson(text: string) {
  const t = text.toLowerCase();
  // very loose heuristic
  if (!(t.includes("{") || t.includes("["))) return false;
  return t.includes("keyword") || t.includes("rank") || t.includes("realtime") || t.includes("portal");
}

function extractUrlHintsFromJs(js: string) {
  // Grab likely endpoints/paths from a JS bundle.
  // Note: we keep this intentionally broad; we'll manually pick the right one from output if needed.
  const hits = new Set<string>();

  function addAll(re: RegExp) {
    // Avoid String#matchAll to keep TS target compatibility in CI builds.
    const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = r.exec(js)) !== null) {
      hits.add(m[0]);
      // Safety: avoid infinite loops on zero-length matches
      if (m[0].length === 0) r.lastIndex++;
    }
  }

  // absolute URLs
  addAll(/https?:\/\/[^\s"'`<>]+/g);
  // root-relative paths with common endpoint-ish patterns
  addAll(/\/[a-zA-Z0-9][a-zA-Z0-9\-_/]*\.(?:json|php|txt)(?:\?[^\s"'`<>]*)?/g);
  addAll(/\/wp-json\/[a-zA-Z0-9\-_/]+(?:\?[^\s"'`<>]*)?/g);
  addAll(/\/api\/[a-zA-Z0-9\-_/]+(?:\?[^\s"'`<>]*)?/g);
  addAll(/\/realtime[^\s"'`<>]*/g);

  return Array.from(hits).slice(0, 200);
}

function safeTruncate(s: string, max = 2000) {
  return s.length <= max ? s : `${s.slice(0, max)}\n... (truncated)`;
}

function parseKoreanNowtimeToTimestamp(nowtime: string): string | null {
  // Example: "2026년 03월 12일 02시 10분"
  const m = nowtime.match(
    /(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일\s*(\d{1,2})\s*시\s*(\d{1,2})\s*분/,
  );
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const pad = (n: string) => String(Number(n)).padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}`;
}

function pickContentType(resp: Response) {
  const h = resp.headers();
  return h["content-type"] ?? null;
}

async function extractItemsFromDom(page: Page, timestamp: string): Promise<RealtimeItem[]> {
  const portalIds = ["google", "daum", "zum", "nate", "googletrend"];
  const out: RealtimeItem[] = [];

  for (const portal of portalIds) {
    const root = page.locator(`#${portal}`);
    if ((await root.count()) === 0) continue;

    // timestandard can be empty or missing
    const timeText = (await root.locator(".timestandard").first().innerText().catch(() => "")).trim();

    // Each row is like: <p><span class="...no">1</span><span class="keyword"><a>...</a></span></p>
    const rows = root.locator(".innerbox p");
    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const row = rows.nth(i);
      const rankText = (await row.locator("span").first().innerText().catch(() => "")).trim();
      const rank = Number(rankText) || i + 1;

      const a = row.locator(".keyword a");
      const hasA = (await a.count()) > 0;
      const keyword = hasA
        ? (await a.first().innerText().catch(() => "")).trim()
        : (await row.locator(".keyword").first().innerText().catch(() => "")).trim();

      if (!keyword || keyword === "-") continue;

      out.push({
        portal,
        rank,
        keyword,
        timestamp,
        raw: { timeText },
      });
    }
  }

  out.sort((a, b) => (a.portal === b.portal ? a.rank - b.rank : a.portal.localeCompare(b.portal)));
  return out;
}

async function newKoreanLikeContext() {
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext({
    locale: "ko-KR",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    extraHTTPHeaders: {
      "Accept-Language": "ko-KR,ko;q=0.9",
      Referer: "https://adsensefarm.kr/",
    },
  });
  return { browser, context };
}

async function sniffEndpoints(): Promise<{ candidates: EndpointCandidate[]; scriptHints: ScriptHint[] }> {
  const { browser, context } = await newKoreanLikeContext();
  const page = await context.newPage();

  const candidates: EndpointCandidate[] = [];
  const seen = new Set<string>();
  const scriptHints: ScriptHint[] = [];
  const seenScripts = new Set<string>();

  page.on("response", async (resp) => {
    try {
      const url = resp.url();
      const status = resp.status();
      const ct = pickContentType(resp);
      const ctLower = (ct ?? "").toLowerCase();

      // 1) Capture JSON responses (best case)
      const isJson = ctLower.includes("application/json") || ctLower.includes("text/json");
      if (isJson) {
        if (seen.has(url)) return;
        const text = await resp.text();
        if (!looksLikeKeywordJson(text)) return;
        seen.add(url);
        candidates.push({
          url,
          status,
          contentType: ct,
          sample: safeTruncate(text, 2000),
          seenAt: new Date().toISOString(),
        });
        return;
      }

      // 2) Capture first-party JS and extract endpoint-ish hints
      const isJs = ctLower.includes("javascript") || ctLower.includes("ecmascript");
      const isFirstParty = url.startsWith("https://adsensefarm.kr/") || url.startsWith("http://adsensefarm.kr/");
      if (isJs && isFirstParty) {
        if (seenScripts.has(url)) return;
        seenScripts.add(url);
        const js = await resp.text();
        const extractedUrls = extractUrlHintsFromJs(js);
        if (extractedUrls.length) {
          scriptHints.push({ scriptUrl: url, extractedUrls, seenAt: new Date().toISOString() });
        }
      }
    } catch {
      // ignore
    }
  });

  const nav = await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const status = nav?.status() ?? -1;
  const title = await page.title().catch(() => "");

  console.log("page_status:", status);
  console.log("page_title:", title);

  // give JS time to load XHR/fetch
  await page.waitForTimeout(10_000);

  await browser.close();
  return { candidates, scriptHints };
}

function normalize(raw: unknown, timestamp: string): RealtimeItem[] {
  const out: RealtimeItem[] = [];

  // Heuristic 1: array of objects with keyword/rank
  if (Array.isArray(raw)) {
    for (const r of raw) {
      if (!r || typeof r !== "object") continue;
      const obj = r as Record<string, unknown>;
      const keyword = (obj.keyword ?? obj.kw ?? obj.term ?? obj.query) as unknown;
      const rank = (obj.rank ?? obj.order ?? obj.no) as unknown;
      if (typeof keyword === "string" && keyword.trim()) {
        out.push({
          portal: String(obj.portal ?? obj.source ?? obj.site ?? "unknown"),
          rank: typeof rank === "number" ? rank : Number(rank ?? 0),
          keyword: keyword.trim(),
          change: typeof obj.change === "string" ? obj.change : typeof obj.diff === "string" ? obj.diff : undefined,
          timestamp,
          raw: r,
        });
      }
    }
  }

  // Heuristic 2: dict keyed by portal => list
  if (out.length === 0 && raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const root = (obj.data ?? obj.result ?? obj.results ?? obj.items ?? obj) as unknown;
    if (root && typeof root === "object" && !Array.isArray(root)) {
      for (const [portal, v] of Object.entries(root as Record<string, unknown>)) {
        if (!Array.isArray(v)) continue;
        for (const r of v) {
          if (!r || typeof r !== "object") continue;
          const rr = r as Record<string, unknown>;
          const keyword = (rr.keyword ?? rr.kw ?? rr.term ?? rr.query) as unknown;
          const rank = (rr.rank ?? rr.order ?? rr.no) as unknown;
          if (typeof keyword === "string" && keyword.trim()) {
            out.push({
              portal,
              rank: typeof rank === "number" ? rank : Number(rank ?? 0),
              keyword: keyword.trim(),
              change: typeof rr.change === "string" ? rr.change : typeof rr.diff === "string" ? rr.diff : undefined,
              timestamp,
              raw: r,
            });
          }
        }
      }
    }
  }

  // Sort stable
  out.sort((a, b) => (a.portal === b.portal ? a.rank - b.rank : a.portal.localeCompare(b.portal)));
  return out;
}

async function fetchJsonViaContext(context: BrowserContext, url: string) {
  const res = await context.request.get(url, {
    headers: {
      "Accept-Language": "ko-KR,ko;q=0.9",
      Referer: "https://adsensefarm.kr/realtime/",
    },
    timeout: 60_000,
  });
  const status = res.status();
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    // keep as null
  }
  return { status, text, json };
}

async function fetchOncePreferSaved(): Promise<RealtimeItem[]> {
  const timestamp = nowTimestamp();
  const saved = readJsonFile<{ candidates?: EndpointCandidate[] }>(ENDPOINTS_FILE);
  const urls = (saved?.candidates ?? []).map((c) => c.url);

  const { browser, context } = await newKoreanLikeContext();
  try {
    // Try saved endpoints first
    for (const url of urls) {
      const { status, json, text } = await fetchJsonViaContext(context, url);
      if (status >= 200 && status < 300 && json != null) {
        const items = normalize(json, timestamp);
        if (items.length) {
          writeJsonFile(LATEST_FILE, { source: "saved_endpoint", url, fetchedAt: timestamp, items, raw: json });
          console.log("ok:", "saved_endpoint", url, "items:", items.length);
          return items;
        }
      } else {
        // endpoint might require cookies or be stale; ignore
        if (status === 403) console.log("403 on saved endpoint:", url);
        if (status >= 400) console.log("bad status on saved endpoint:", status, url);
        if (json == null && looksLikeKeywordJson(text)) console.log("json parse failed but looks relevant:", url);
      }
    }

    // If no saved endpoint worked, sniff again and immediately try best candidates
    const sniffed = await sniffEndpoints();
    writeJsonFile(ENDPOINTS_FILE, { target: TARGET_URL, savedAt: timestamp, ...sniffed });
    console.log("sniffed_candidates:", sniffed.candidates.length, "script_hints:", sniffed.scriptHints.length);

    for (const c of sniffed.candidates) {
      const { status, json } = await fetchJsonViaContext(context, c.url);
      if (status >= 200 && status < 300 && json != null) {
        const items = normalize(json, timestamp);
        if (items.length) {
          writeJsonFile(LATEST_FILE, { source: "fresh_sniff", url: c.url, fetchedAt: timestamp, items, raw: json });
          console.log("ok:", "fresh_sniff", c.url, "items:", items.length);
          return items;
        }
      }
    }

    // Fallback 1: call first-party PHP endpoints used by realtime.js (highest signal).
    // realtime.js does: fetch(`${section}.php`) and expects JSON { result, nowtime, data: [keywords...] }
    const sections = ["google", "daum", "zum", "nate", "googletrend"] as const;
    const aggregated: RealtimeItem[] = [];
    for (const section of sections) {
      const url = `https://adsensefarm.kr/realtime/${section}.php`;
      const { status, json } = await fetchJsonViaContext(context, url);
      if (status >= 200 && status < 300 && json && typeof json === "object") {
        const obj = json as Record<string, unknown>;
        const ok = obj.result === "success";
        const data = obj.data;
        const nowtime = typeof obj.nowtime === "string" ? obj.nowtime : null;
        const parsedTs = nowtime ? parseKoreanNowtimeToTimestamp(nowtime) : null;
        if (ok && Array.isArray(data)) {
          for (let i = 0; i < data.length; i++) {
            const kw = data[i];
            if (typeof kw !== "string" || !kw.trim()) continue;
            aggregated.push({
              portal: section,
              rank: i + 1,
              keyword: kw.trim(),
              timestamp: parsedTs ?? timestamp,
              raw: { nowtime },
            });
          }
        }
      } else if (status === 403) {
        console.log("403 on php endpoint:", url);
      }
    }
    if (aggregated.length) {
      aggregated.sort((a, b) => (a.portal === b.portal ? a.rank - b.rank : a.portal.localeCompare(b.portal)));
      writeJsonFile(LATEST_FILE, {
        source: "php_endpoints",
        url: "https://adsensefarm.kr/realtime/{section}.php",
        fetchedAt: timestamp,
        items: aggregated,
      });
      console.log("ok:", "php_endpoints", "items:", aggregated.length);
      return aggregated;
    }

    // Fallback 2: parse DOM (some portals are server-rendered in HTML).
    const page = await context.newPage();
    const nav = await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => null);
    console.log("page_fetch_status:", nav?.status() ?? "unknown");
    await page.waitForTimeout(5000);
    const domItems = await extractItemsFromDom(page, timestamp);
    if (domItems.length) {
      writeJsonFile(LATEST_FILE, { source: "dom_parse", url: TARGET_URL, fetchedAt: timestamp, items: domItems });
      console.log("ok:", "dom_parse", "items:", domItems.length);
      return domItems;
    }
    const html = await page.content();
    writeJsonFile(join(CACHE_DIR, "adsensefarm_page_fallback.json"), {
      fetchedAt: timestamp,
      note: "No JSON endpoint worked; stored HTML snapshot (truncated) for debugging.",
      html: safeTruncate(html, 20000),
    });
    return [];
  } finally {
    await browser.close();
  }
}

function diffByPortalRank(prev: RealtimeItem[], cur: RealtimeItem[]) {
  const key = (x: RealtimeItem) => `${x.portal}::${x.rank}`;
  const pm = new Map(prev.map((x) => [key(x), x]));
  const cm = new Map(cur.map((x) => [key(x), x]));

  const changes: unknown[] = [];
  // Avoid iterating MapIterator directly for TS downlevel compatibility in CI.
  for (const [k, c] of Array.from(cm.entries())) {
    const p = pm.get(k);
    if (!p) changes.push({ type: "new", item: c });
    else if (p.keyword !== c.keyword || (p.change ?? "") !== (c.change ?? "")) changes.push({ type: "updated", before: p, after: c });
  }
  return changes;
}

async function runLoop() {
  const minMinutes = 5;
  const maxMinutes = 10;
  let prev = readJsonFile<{ items?: RealtimeItem[] }>(LATEST_FILE)?.items ?? [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const cur = await fetchOncePreferSaved();
    const changes = diffByPortalRank(prev, cur);
    console.log(`[${new Date().toISOString()}] items=${cur.length} changes=${changes.length}`);
    if (changes.length) {
      writeJsonFile(join(CACHE_DIR, "adsensefarm_changes_latest.json"), {
        detectedAt: nowTimestamp(),
        changes,
      });
      console.log("changes_sample:", JSON.stringify(changes.slice(0, 10), null, 2));
    }
    prev = cur;

    let sleepSec = Math.floor((minMinutes * 60) + Math.random() * ((maxMinutes - minMinutes) * 60));
    sleepSec += Math.floor(-20 + Math.random() * 60); // jitter
    sleepSec = Math.max(60, sleepSec);
    console.log("sleep_seconds:", sleepSec);
    await sleep(sleepSec * 1000);
  }
}

async function main() {
  const cmd = process.argv[2] ?? "once";
  ensureDir(CACHE_DIR);

  if (cmd === "sniff") {
    const sniffed = await sniffEndpoints();
    const ts = nowTimestamp();
    writeJsonFile(ENDPOINTS_FILE, { target: TARGET_URL, savedAt: ts, ...sniffed });
    console.log(
      "saved:",
      ENDPOINTS_FILE,
      "candidates:",
      sniffed.candidates.length,
      "script_hints:",
      sniffed.scriptHints.length,
    );
    return;
  }

  if (cmd === "once") {
    const items = await fetchOncePreferSaved();
    console.log("items:", items.length);
    if (items.length) console.log("sample:", JSON.stringify(items.slice(0, 10), null, 2));
    else console.log("no items parsed. Check:", ENDPOINTS_FILE, "and", join(CACHE_DIR, "adsensefarm_page_fallback.json"));
    return;
  }

  if (cmd === "loop") {
    await runLoop();
    return;
  }

  console.log("Unknown command:", cmd);
  console.log("Use: sniff | once | loop");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});

