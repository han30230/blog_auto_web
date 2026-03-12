/**
 * Local testing script: health, keywords, trigger job, print results.
 * Run with: pnpm test:local
 * Ensure the dev server is running on http://localhost:3000 (or set BASE_URL).
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function post(path: string, body: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("Base URL:", BASE);
  console.log("---");

  const health = await get("/api/health");
  console.log("1. GET /api/health:", health.status, health.ok ? "OK" : "FAIL");
  if (!health.ok) console.log("   Response:", health.data);

  const keywords = await get("/api/keywords");
  console.log("2. GET /api/keywords:", keywords.status, keywords.ok ? "OK" : "FAIL");
  const list = Array.isArray((keywords.data as { data?: unknown[] })?.data)
    ? (keywords.data as { data: unknown[] }).data
    : [];
  console.log("   Keywords count:", list.length);

  const jobsBefore = await get("/api/jobs");
  const jobRes = await post("/api/jobs", { source: "google_trends" });
  console.log("3. POST /api/jobs (google_trends):", jobRes.status, jobRes.ok ? "OK" : "FAIL");
  if (jobRes.ok && typeof jobRes.data === "object" && jobRes.data !== null && "data" in jobRes.data) {
    const d = (jobRes.data as { data?: { job?: { id: string; status: string } } }).data;
    if (d?.job) console.log("   Job id:", d.job.id, "status:", d.job.status);
  } else {
    console.log("   Response:", jobRes.data);
  }

  const sources = await get("/api/sources");
  console.log("4. GET /api/sources:", sources.status, sources.ok ? "OK" : "FAIL");

  const keywordsAfter = await get("/api/keywords?limit=5");
  const listAfter = Array.isArray((keywordsAfter.data as { data?: unknown[] })?.data)
    ? (keywordsAfter.data as { data: unknown[] }).data
    : [];
  console.log("   Keywords after job (sample):", listAfter.length);

  console.log("---");
  console.log("Done.");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
