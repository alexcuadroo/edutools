import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { requireAuth, parseCookie, clearSessionCookie, jsonResponse, AuthError } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimit = await checkRateLimit(context.env, `delete-account:${ip}`, 3, 3600);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Demasiados intentos. Intentá de nuevo más tarde." },
        429,
        { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
      );
    }

    const { userId, user } = await requireAuth(context.request, context.env);

    const body = await context.request.json().catch(() => ({})) as { confirm?: unknown };
    if (body.confirm !== user.email) {
      return jsonResponse({ error: "Confirmación inválida. Ingresá tu email para confirmar." }, 400);
    }

    const puzzleIdxList = await context.env.USERS.list({ prefix: `puzzle-idx:${userId}:` });
    for (const key of puzzleIdxList.keys) {
      const puzzleId = await context.env.USERS.get(key.name);
      if (puzzleId) {
        await context.env.USERS.delete(`puzzle:${userId}:${puzzleId}`);
      }
      await context.env.USERS.delete(key.name);
    }

    await context.env.USERS.delete(`user:${userId}`);
    await context.env.USERS.delete(`email-idx:${user.email}`);

    const sessions = await context.env.SESSIONS.list({ prefix: "session:" });
    for (const key of sessions.keys) {
      const sessionStr = await context.env.SESSIONS.get(key.name);
      if (sessionStr) {
        const session = JSON.parse(sessionStr) as { userId: string };
        if (session.userId === userId) {
          await context.env.SESSIONS.delete(key.name);
        }
      }
    }

    const cookieHeader = context.request.headers.get("Cookie") || "";
    const token = parseCookie(cookieHeader, SESSION_COOKIE_NAME);
    if (token) {
      await context.env.SESSIONS.delete(`session:${token}`);
    }

    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders, "Set-Cookie": clearSessionCookie() },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return jsonResponse({ error: err.message }, err.status);
    }
    console.error("Error en delete account:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};