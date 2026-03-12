import crypto from "crypto";

const ALGORITHM = "HmacSHA256";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Format: yyMMdd'T'HHmmss'Z' (GMT)
 * Example: 260311T063012Z
 */
export function formatCoupangSignedDate(date = new Date()): string {
  const yy = pad2(date.getUTCFullYear() % 100);
  const MM = pad2(date.getUTCMonth() + 1);
  const dd = pad2(date.getUTCDate());
  const HH = pad2(date.getUTCHours());
  const mm = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return `${yy}${MM}${dd}T${HH}${mm}${ss}Z`;
}

/**
 * Coupang Partners HMAC Authorization header generator.
 *
 * message = signedDate + method + path + query
 * Authorization format:
 * CEA algorithm=HmacSHA256, access-key=..., signed-date=..., signature=...
 */
export function createCoupangAuthorization({
  method,
  uri,
  secretKey,
  accessKey,
  signedDate = formatCoupangSignedDate(),
}: {
  method: string;
  /** Must be path + optional query string. e.g. "/v2/.../deeplink" or "/v2/.../products/search?keyword=..." */
  uri: string;
  secretKey: string;
  accessKey: string;
  signedDate?: string;
}): { authorization: string; signedDate: string } {
  const [path, query = ""] = uri.split("?");
  if (!path.startsWith("/")) {
    throw new Error("uri must start with '/'");
  }
  const message = `${signedDate}${method.toUpperCase()}${path}${query}`;
  const signature = crypto
    .createHmac("sha256", Buffer.from(secretKey, "utf8"))
    .update(Buffer.from(message, "utf8"))
    .digest("hex");

  const authorization = `CEA algorithm=${ALGORITHM}, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
  return { authorization, signedDate };
}

