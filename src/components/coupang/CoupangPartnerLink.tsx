"use client";

import { useCallback, useState } from "react";

async function getPartnerShortUrl(originalUrl: string): Promise<string | null> {
  const res = await fetch("/api/coupang/deeplink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coupangUrls: [originalUrl] }),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as
    | { data?: Array<{ originalUrl: string; shortenUrl: string | null }> }
    | null;
  const item = json?.data?.[0];
  return item?.shortenUrl ?? null;
}

/**
 * 쿠팡 원본 URL을 클릭하면 서버에서 파트너스 딥링크로 변환 후 이동합니다.
 * - 변환 실패 시: 원본 URL로 이동
 */
export function CoupangPartnerLink({
  originalUrl,
  className,
  children,
  target = "_blank",
}: {
  originalUrl: string;
  className?: string;
  children: React.ReactNode;
  target?: "_blank" | "_self";
}) {
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      try {
        const short = await getPartnerShortUrl(originalUrl);
        const dest = short ?? originalUrl;
        if (target === "_self") window.location.href = dest;
        else window.open(dest, "_blank", "noopener,noreferrer");
      } finally {
        setLoading(false);
      }
    },
    [loading, originalUrl, target]
  );

  return (
    <a
      href={originalUrl}
      onClick={onClick}
      className={className}
      aria-busy={loading}
    >
      {children}
    </a>
  );
}

