const requestCounts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;

export function checkRateLimit(ip: string, maxRequests: number = 30): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
