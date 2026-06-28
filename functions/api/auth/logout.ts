import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { parseCookie, destroySession, clearSessionCookie, jsonResponse } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/env";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const cookieHeader = context.request.headers.get("Cookie") || "";
    const token = parseCookie(cookieHeader, SESSION_COOKIE_NAME);

    if (token) {
      await destroySession(context.env, token);
    }

    const cookie = clearSessionCookie();
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders, "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error("Error en logout:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
