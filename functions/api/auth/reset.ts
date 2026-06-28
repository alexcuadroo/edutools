import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { hashPassword, jsonResponse } from "@/lib/auth";
import { isValidPassword } from "@/lib/validation";
import type { UserRecord, ResetTokenRecord } from "@/lib/types";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();
    const { token, newPassword } = body as { token?: unknown; newPassword?: unknown };

    if (typeof token !== "string" || token.length === 0) {
      return jsonResponse({ error: "Token inválido o expirado" }, 400);
    }
    if (!isValidPassword(newPassword)) {
      return jsonResponse({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
    }

    const tokenStr = await context.env.USERS.get(`reset-token:${token}`);
    if (!tokenStr) {
      return jsonResponse({ error: "Token inválido o expirado" }, 400);
    }

    const tokenRecord: ResetTokenRecord = JSON.parse(tokenStr);
    const now = Date.now();
    if (now > tokenRecord.expiresAt) {
      await context.env.USERS.delete(`reset-token:${token}`);
      return jsonResponse({ error: "Token inválido o expirado" }, 400);
    }

    const userStr = await context.env.USERS.get(`user:${tokenRecord.userId}`);
    if (!userStr) {
      return jsonResponse({ error: "Token inválido o expirado" }, 400);
    }

    const user: UserRecord = JSON.parse(userStr);
    user.passwordHash = hashPassword(newPassword);
    await context.env.USERS.put(`user:${user.id}`, JSON.stringify(user));
    await context.env.USERS.delete(`reset-token:${token}`);

    const sessions = await context.env.SESSIONS.list({ prefix: "session:" });
    for (const key of sessions.keys) {
      const sessionStr = await context.env.SESSIONS.get(key.name);
      if (sessionStr) {
        const session = JSON.parse(sessionStr) as { userId: string };
        if (session.userId === user.id) {
          await context.env.SESSIONS.delete(key.name);
        }
      }
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error("Error en reset:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
