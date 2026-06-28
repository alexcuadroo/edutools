import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { requireAuth, toPublicUser, jsonResponse, AuthError } from "@/lib/auth";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { user } = await requireAuth(context.request, context.env);
    return jsonResponse({ user: toPublicUser(user) }, 200);
  } catch (err) {
    if (err instanceof AuthError) {
      return jsonResponse({ error: err.message }, err.status);
    }
    console.error("Error en me:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
