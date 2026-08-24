import { NextRequest } from 'next/server';

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_TRACKED_CLIENTS = 10_000; // cap memory; oldest entries are evicted

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getRateLimitWindowMs(): number {
  return parsePositiveInt(
    process.env.PDF_PARSE_RATE_LIMIT_WINDOW_MS,
    DEFAULT_RATE_LIMIT_WINDOW_MS,
  );
}

function getRateLimitMaxRequests(): number {
  return parsePositiveInt(
    process.env.PDF_PARSE_RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  );
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers?.get('x-forwarded-for') || '';
  const realIp = request.headers?.get('x-real-ip') || '';
  const candidate = forwardedFor.split(',')[0]?.trim() || realIp.trim();
  return candidate || 'unknown';
}

/**
 * Drop expired entries and, if still over the size cap, evict the
 * soonest-to-expire entries. Keeps the store bounded under IP-spoofing DoS.
 */
function pruneStore(now: number): void {
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }

  if (rateLimitStore.size <= MAX_TRACKED_CLIENTS) return;

  const sorted = [...rateLimitStore.entries()].sort(
    (a, b) => a[1].resetAt - b[1].resetAt,
  );
  const toEvict = rateLimitStore.size - MAX_TRACKED_CLIENTS;
  for (let i = 0; i < toEvict; i++) {
    rateLimitStore.delete(sorted[i][0]);
  }
}

export function checkPdfParseRateLimit(request: NextRequest): {
  limited: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  pruneStore(now);
  const windowMs = getRateLimitWindowMs();
  const maxRequests = getRateLimitMaxRequests();
  const clientIp = getClientIp(request);
  const existing = rateLimitStore.get(clientIp);

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(clientIp, { count: 1, resetAt: now + windowMs });
    return { limited: false };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    );
    return { limited: true, retryAfterSeconds };
  }

  existing.count += 1;
  rateLimitStore.set(clientIp, existing);
  return { limited: false };
}

export function resetPdfParseRateLimitForTests() {
  rateLimitStore.clear();
}

