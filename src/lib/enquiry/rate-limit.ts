/**
 * Small in-memory per-key limiter. NOTE: state lives in one server instance only.
 * On serverless (Vercel) each instance has its own counter, so this slows spam
 * but is not a hard guarantee.
 */
export type RateLimiter = { allow(key: string): boolean };

export function createRateLimiter(limit = 5, windowMs = 10 * 60 * 1000, now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    allow(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.every((x) => t - x >= windowMs)) hits.delete(k);
      }
      return true;
    },
  };
}

/** First address in x-forwarded-for, or a shared bucket when absent. */
export function clientIp(headers: { get(name: string): string | null }): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
