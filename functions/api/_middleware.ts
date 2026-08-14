import { corsHeaders } from "./utils";
import { checkRateLimit } from "./rate-limiter";

export const onRequest: PagesFunction<{ ENVIRONMENT?: string }> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const isProduction = context.env.ENVIRONMENT === "production";
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
  const pathname = new URL(context.request.url).pathname;
  const isProgressRequest = /^\/api\/(progress\/|puzzles\/saved\/[^/]+\/progreso$)/.test(pathname);
  const rateLimitKey = isProgressRequest ? `progress:${ip}` : ip;
  const maxRequests = isProgressRequest ? (isProduction ? 600 : 10_000) : (isProduction ? 30 : 10_000);
  const { allowed, remaining, resetAt } = checkRateLimit(rateLimitKey, maxRequests);

  if (!allowed) {
    return Response.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Remaining", String(remaining));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
