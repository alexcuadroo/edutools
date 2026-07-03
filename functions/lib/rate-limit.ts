import type { Env } from "./env";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  env: Env,
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (env.ENVIRONMENT !== "production") {
    return { allowed: true, remaining: maxAttempts, resetAt: Date.now() + windowSeconds * 1000 };
  }

  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const storageKey = `rl:${key}`;

  const existing = await env.USERS.get(storageKey);
  if (!existing) {
    await env.USERS.put(storageKey, JSON.stringify({ count: 1, resetAt }), {
      expirationTtl: windowSeconds,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }

  const data = JSON.parse(existing) as { count: number; resetAt: number };

  if (now > data.resetAt) {
    await env.USERS.put(storageKey, JSON.stringify({ count: 1, resetAt }), {
      expirationTtl: windowSeconds,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }

  if (data.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: data.resetAt };
  }

  const newCount = data.count + 1;
  const remainingTtl = Math.max(60, Math.ceil((data.resetAt - now) / 1000));
  await env.USERS.put(storageKey, JSON.stringify({ count: newCount, resetAt: data.resetAt }), {
    expirationTtl: remainingTtl,
  });
  return { allowed: true, remaining: maxAttempts - newCount, resetAt: data.resetAt };
}
