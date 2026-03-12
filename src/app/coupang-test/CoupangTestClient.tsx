"use client";

import React from "react";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
      {children}
    </div>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
      {value}
    </pre>
  );
}

function ResultRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </div>
      <div className="text-sm text-zinc-900 dark:text-zinc-100">{value}</div>
    </div>
  );
}

export function CoupangTestClient() {
  const [keyword, setKeyword] = React.useState("노트북");
  const [url, setUrl] = React.useState("https://www.coupang.com/");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [shortUrl, setShortUrl] = React.useState<string | null>(null);
  const [raw, setRaw] = React.useState<string>("");
  const [products, setProducts] = React.useState<
    Array<{
      productId: number | null;
      productName: string;
      productPrice: number | null;
      productImage: string | null;
      productUrl: string | null;
      rank: number | null;
      isRocket: boolean | null;
      isFreeShipping: boolean | null;
    }>
  >([]);

  const onConvert = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setShortUrl(null);
    setRaw("");
    try {
      const res = await fetch("/api/coupang/deeplink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupangUrls: [url] }),
      });
      const text = await res.text();
      setRaw(text);
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return;
      }
      const json = JSON.parse(text) as {
        data?: Array<{ originalUrl: string; shortenUrl: string | null }>;
      };
      const item = json.data?.[0];
      setShortUrl(item?.shortenUrl ?? null);
      if (!item?.shortenUrl) setError("shortenUrl이 비어 있습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "변환 실패");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const onSearchProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setProducts([]);
    setRaw("");
    try {
      const qp = new URLSearchParams({ keyword, limit: "10" });
      const res = await fetch(`/api/coupang/products/search?${qp.toString()}`);
      const text = await res.text();
      setRaw(text);
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return;
      }
      const json = JSON.parse(text) as {
        data?: Array<{
          productId: number | null;
          productName: string;
          productPrice: number | null;
          productImage: string | null;
          productUrl: string | null;
          rank: number | null;
          isRocket: boolean | null;
          isFreeShipping: boolean | null;
        }>;
      };
      setProducts(json.data ?? []);
      if (!json.data?.length) setError("검색 결과가 없습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "검색 실패");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <FieldLabel>상품 검색 키워드 (products/search)</FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예) 노트북"
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            onClick={onSearchProducts}
            disabled={loading || !keyword}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "검색 중..." : "상품 검색"}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          검색 결과의 <span className="font-medium">상품명 클릭</span> 시: 해당
          상품 URL을 파트너스 딥링크로 변환 후 바로 이동합니다.
        </p>
      </div>

      {products.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            검색 결과 (TOP {products.length})
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {products.map((p, idx) => (
              <li
                key={`${p.productId ?? "noid"}-${idx}`}
                className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
                  {p.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.productImage}
                      alt={p.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={p.productUrl ?? "#"}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!p.productUrl) return;
                      const res = await fetch("/api/coupang/deeplink", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ coupangUrls: [p.productUrl] }),
                      });
                      const json = (await res.json().catch(() => null)) as
                        | {
                            data?: Array<{
                              originalUrl: string;
                              shortenUrl: string | null;
                            }>;
                          }
                        | null;
                      const short = json?.data?.[0]?.shortenUrl ?? null;
                      window.open(short ?? p.productUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="line-clamp-2 text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
                    title={p.productName}
                  >
                    {p.productName}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {p.productPrice != null && <span>{p.productPrice.toLocaleString("ko-KR")}원</span>}
                    {p.isRocket ? (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                        로켓
                      </span>
                    ) : null}
                    {p.isFreeShipping ? (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        무료배송
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <FieldLabel>쿠팡 원본 URL</FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.coupang.com/..."
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            onClick={onConvert}
            disabled={loading || !url}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "변환 중..." : "딥링크 변환"}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          변환은 서버에서 수행됩니다. (환경변수: COUPANG_ACCESS_KEY /
          COUPANG_SECRET_KEY)
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          오류: {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <ResultRow
          label="원본 URL"
          value={
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-zinc-700 hover:underline dark:text-zinc-300"
            >
              {url}
            </a>
          }
        />
        <ResultRow
          label="파트너스 단축 URL"
          value={
            shortUrl ? (
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-700 hover:underline dark:text-blue-300"
              >
                {shortUrl}
              </a>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400">—</span>
            )
          }
        />
      </div>

      {raw && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Raw response
          </div>
          <CodeBlock value={raw} />
        </div>
      )}
    </div>
  );
}

