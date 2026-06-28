import type { Env } from "@/lib/env";
import { corsHeaders, VERIFY_TOKEN_TTL_SECONDS, getSiteUrl } from "@/lib/env";
import { generateToken, jsonResponse } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail, renderVerificationEmail } from "@/lib/email";
import type { UserRecord } from "@/lib/types";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimit = await checkRateLimit(context.env, `resend:${ip}`, 3, 3600);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Demasiados intentos. Intentá de nuevo más tarde." },
        429,
        { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
      );
    }

    const body = await context.request.json();
    const { email } = body as { email?: unknown };

    if (!isValidEmail(email)) {
      return jsonResponse({ ok: true }, 200);
    }

    const normalizedEmail = normalizeEmail(email);
    const userId = await context.env.USERS.get(`email-idx:${normalizedEmail}`);

    if (userId) {
      const userStr = await context.env.USERS.get(`user:${userId}`);
      if (userStr) {
        const user: UserRecord = JSON.parse(userStr);
        if (!user.verified) {
          const verifyToken = generateToken(16);
          const now = Date.now();
          const verifyExpiresAt = now + VERIFY_TOKEN_TTL_SECONDS * 1000;

          await context.env.USERS.put(
            `verify-token:${verifyToken}`,
            JSON.stringify({ userId, expiresAt: verifyExpiresAt }),
            { expirationTtl: VERIFY_TOKEN_TTL_SECONDS }
          );

          const siteUrl = getSiteUrl(context.request);
          const verifyUrl = `${siteUrl}/api/auth/verify?token=${verifyToken}`;
          const emailMessage = renderVerificationEmail(user.displayName, verifyUrl);
          emailMessage.to = normalizedEmail;

          await sendEmail(emailMessage, context.env);
        }
      }
    }

    return jsonResponse(
      { ok: true, message: "Si el email existe y no está verificado, te enviamos un link" },
      200
    );
  } catch (err) {
    console.error("Error en resend-verification:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
