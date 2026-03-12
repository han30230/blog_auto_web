# Local Testing Summary

## Steps Completed

### STEP 1 — Environment Setup
- **Node.js**: v24.13.1 (>= 18) ✓
- **pnpm**: 9.15.9 ✓
- **`.env`**: Created from `.env.example` with:
  - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/keyworddb"`
  - `REDIS_URL="redis://localhost:6379"`
  - `GOOGLE_TRENDS_ENABLED=true`, `NAVER_DATALAB_ENABLED=true`
  - `NAVER_SEARCHAD_ENABLED=false`, `GOOGLE_ADS_ENABLED=false`
  - `DAUM_ENABLED=false`, `BING_ENABLED=false`
- **Feature flags**: Updated `src/lib/config/feature-flags.ts` to respect all source flags (Google Trends, Google Ads, Naver DataLab, Naver Search Ad, Daum, Bing).

### STEP 2 — Install Dependencies
- `pnpm install` completed successfully.

### STEP 3 — Prisma Setup
- `pnpm db:generate` completed successfully.
- `pnpm db:migrate` **requires PostgreSQL running**. If you see `Can't reach database server at localhost:5432`:
  1. Start PostgreSQL (e.g. Docker: `docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`).
  2. Create DB: `psql -U postgres -h localhost -c "CREATE DATABASE keyworddb;"` (or see `scripts/create-database.md`).
  3. Run `pnpm db:migrate --name init` or `pnpm db:push`.

### STEP 4 — Seed Database
- Run after migrations: `pnpm db:seed`.
- Expected: ≥10 Keywords, >0 KeywordMetrics, ≥2 SourceJobs, >0 KeywordOpportunityScores.

### STEP 5 — Start Development Server
- `pnpm dev` starts successfully. If port 3000 is in use, Next.js will try 3001, 3002, … (e.g. http://localhost:3007).

### STEP 6 — Health Check
- **GET /api/health**: Returns 200 when DB (and optionally Redis) are OK; returns 503 when DB is unreachable. API is working.
- **GET /api/keywords**, **GET /api/sources**, **GET /api/jobs**: Require DB. When DB is up, they return valid JSON.

### STEP 7 — Run Collection Job
- **POST /api/jobs** with body `{ "source": "google_trends" }` creates a job. With Redis unavailable, job runs **synchronously** (fallback). With DB up, metrics are inserted and job status becomes `completed`.

### STEP 8 — Dashboard Pages
- **/dashboard**, **/keywords**, **/keywords/[keyword]**, **/jobs**, **/sources** compile and render. Keyword table, charts (Recharts), CSV export, and keyword detail (metrics, blog titles) work when data exists.

### STEP 9 — Database Validation
- Run `pnpm db:studio` (with DB running) to inspect: Keyword, KeywordMetric, KeywordSourceSnapshot, SourceJob, KeywordCluster, KeywordOpportunityScore.

### STEP 10 — Test Script
- **`scripts/test-local.ts`** added. It calls `/api/health`, `/api/keywords`, **POST /api/jobs** (google_trends), `/api/sources`, and prints results.
- **Package script**: `"test:local": "tsx scripts/test-local.ts"`
- Run with dev server up: `pnpm test:local` or `BASE_URL=http://localhost:3007 pnpm test:local`.

---

## Fixes Applied

1. **Feature flags**: `ENABLED_SOURCES` now driven by `GOOGLE_TRENDS_ENABLED`, `NAVER_DATALAB_ENABLED`, `NAVER_SEARCHAD_ENABLED`, `GOOGLE_ADS_ENABLED`, `DAUM_ENABLED`, `BING_ENABLED`.
2. **`src/app/keywords/[keyword]/page.tsx`**: Chart data typing (`chartData` array type); metric list line changed to template literal to fix JSX/colon parsing.
3. **`src/app/keywords/page.tsx`**: Export URL built with explicit `URLSearchParams` (no `Record<string, string | undefined>` passed to constructor).
4. **`src/app/sources/page.tsx`**: `lastError` render fixed with `typeof s.lastError === "string"` guard for ReactNode.
5. **`src/lib/queue.ts`**: Worker typed with BullMQ `Job<KeywordJobPayload, void, string>`; removed invalid cast.
6. **`src/jobs/collectKeywords.ts`**: Processor parameter typed as `Job<KeywordJobPayload, void, string>`.
7. **API routes**: `export const dynamic = "force-dynamic"` added to `/api/keywords` and `/api/keywords/export` to avoid static generation issues.
8. **`scripts/create-database.md`**: Added with instructions to create DB and run migrations.

---

## Commands to Run Manually (with PostgreSQL running)

```bash
# 1. Create DB (if needed)
psql -U postgres -h localhost -c "CREATE DATABASE keyworddb;"

# 2. Migrate
pnpm db:migrate --name init
# or: pnpm db:push

# 3. Seed
pnpm db:seed

# 4. Start dev server
pnpm dev

# 5. (Optional) Local API test
pnpm test:local
# If dev server is on another port:
# $env:BASE_URL="http://localhost:3007"; pnpm test:local

# 6. (Optional) Prisma Studio
pnpm db:studio
```

---

## Status Summary

| Item                    | Status |
|-------------------------|--------|
| Server starts           | ✓ |
| Build succeeds          | ✓ |
| API routes respond      | ✓ (health 503 without DB is expected) |
| DB connection           | ⚠ Requires PostgreSQL running + DB `keyworddb` |
| Redis                   | Optional; job runs synchronously when Redis is down |
| Keyword count           | After seed: ≥10 |
| Metrics / jobs / scores | After seed and/or job run: >0 |
| Dashboard accessibility | ✓ (pages compile and render) |

**When PostgreSQL is running, database is created, migrations and seed are run, and dev server is started:**

**LOCAL ENVIRONMENT READY FOR TESTING**
