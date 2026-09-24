import "server-only";

/**
 * In-memory sliding-window limiter. Good enough for a single-instance deploy;
 * if this ever runs on multiple serverless instances the counters won't be
 * shared, so swap the Map for Upstash/Redis at that point.
 */
const attempts = new Map<string, number[]>();

function prune(key: string, windowMs: number, now: number) {
  const timestamps = attempts.get(key);
  if (!timestamps) return [];
  const fresh = timestamps.filter((t) => now - t < windowMs);
  if (fresh.length) attempts.set(key, fresh);
  else attempts.delete(key);
  return fresh;
}

/** Returns true (and records the attempt) if under the limit; false if the caller should be blocked. */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const fresh = prune(key, windowMs, now);
  if (fresh.length >= max) return false;
  fresh.push(now);
  attempts.set(key, fresh);
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
