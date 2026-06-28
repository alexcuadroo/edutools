import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { verifyPassword, createSession, setSessionCookie, toPublicUser, jsonResponse } from "@/lib/auth";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import type { UserRecord } from "@/lib/types";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimit = await checkRateLimit(context.env, `login:${ip}`, 10, 900);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Demasiados intentos. Intentá de nuevo más tarde." },
        429,
        { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
      );
    }

    const body = await context.request.json();
    const { email, password } = body as { email?: unknown; password?: unknown };

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return jsonResponse({ error: "Email o contraseña incorrectos" }, 401);
    }

    const normalizedEmail = normalizeEmail(email);
    const userId = await context.env.USERS.get(`email-idx:${normalizedEmail}`);
    if (!userId) {
      return jsonResponse({ error: "Email o contraseña incorrectos" }, 401);
    }

    const userStr = await context.env.USERS.get(`user:${userId}`);
    if (!userStr) {
      return jsonResponse({ error: "Email o contraseña incorrectos" }, 401);
    }

    const user: UserRecord = JSON.parse(userStr);

    if (!user.verified) {
      return jsonResponse(
        { error: "Verificá tu email antes de iniciar sesión", code: "EMAIL_NOT_VERIFIED" },
        403
      );
    }

    if (!verifyPassword(user.passwordHash, password)) {
      return jsonResponse({ error: "Email o contraseña incorrectos" }, 401);
    }

    const sessionToken = await createSession(context.env, user.id);
    const cookie = setSessionCookie(sessionToken);

    return jsonResponse({ user: toPublicUser(user) }, 200, {
      "Set-Cookie": cookie,
    });
  } catch (err) {
    console.error("Error en login:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
