import type { Env } from "@/lib/env";
import { corsHeaders, VERIFY_TOKEN_TTL_SECONDS, getSiteUrl } from "@/lib/env";
import { hashPassword, generateToken, jsonResponse } from "@/lib/auth";
import { isValidEmail, isValidPassword, normalizeEmail, sanitizeDisplayName } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail, renderVerificationEmail } from "@/lib/email";
import type { UserRecord } from "@/lib/types";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimit = await checkRateLimit(context.env, `signup:${ip}`, 5, 3600);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Demasiados intentos de registro. Intentá de nuevo más tarde." },
        429,
        { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
      );
    }

    const body = await context.request.json();
    const { email, password, displayName } = body as { email?: unknown; password?: unknown; displayName?: unknown };

    if (!isValidEmail(email)) {
      return jsonResponse({ error: "Email inválido" }, 400);
    }
    if (!isValidPassword(password)) {
      return jsonResponse({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const cleanDisplayName = sanitizeDisplayName(displayName);

    const existingUserId = await context.env.USERS.get(`email-idx:${normalizedEmail}`);
    if (existingUserId) {
      return jsonResponse({ error: "Ya existe una cuenta con este email" }, 409);
    }

    const userId = generateToken(12);
    const passwordHash = hashPassword(password);
    const now = Date.now();

    const user: UserRecord = {
      id: userId,
      email: normalizedEmail,
      displayName: cleanDisplayName,
      passwordHash,
      verified: false,
      createdAt: now,
    };

    await context.env.USERS.put(`user:${userId}`, JSON.stringify(user));
    await context.env.USERS.put(`email-idx:${normalizedEmail}`, userId);

    const verifyToken = generateToken(16);
    const verifyExpiresAt = now + VERIFY_TOKEN_TTL_SECONDS * 1000;
    await context.env.USERS.put(
      `verify-token:${verifyToken}`,
      JSON.stringify({ userId, expiresAt: verifyExpiresAt }),
      { expirationTtl: VERIFY_TOKEN_TTL_SECONDS }
    );

    const siteUrl = getSiteUrl(context.request);
    const verifyUrl = `${siteUrl}/api/auth/verify?token=${verifyToken}`;
    const emailMessage = renderVerificationEmail(cleanDisplayName, verifyUrl);
    emailMessage.to = normalizedEmail;

    await sendEmail(emailMessage, context.env);

    return jsonResponse(
      { ok: true, message: "Te enviamos un email de verificación" },
      201
    );
  } catch (err) {
    console.error("Error en signup:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
