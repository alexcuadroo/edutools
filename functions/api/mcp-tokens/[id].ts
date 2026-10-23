import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { requireAuth, jsonResponse, AuthError } from "@/lib/auth";
import type { McpTokenIndexRecord } from "@/lib/mcp-token";

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const { userId } = await requireAuth(context.request, context.env);
    const id = context.params.id;
    if (typeof id !== "string" || !/^[a-f0-9]{12}$/.test(id)) {
      return jsonResponse({ error: "Token no encontrado" }, 404);
    }

    const key = `mcp-token-index:${userId}:${id}`;
    const value = await context.env.USERS.get(key);
    if (!value) return jsonResponse({ error: "Token no encontrado" }, 404);

    const record = JSON.parse(value) as McpTokenIndexRecord;
    await context.env.SESSIONS.delete(`mcp-token:${record.tokenHash}`);
    await context.env.USERS.delete(key);
    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    if (err instanceof AuthError) return jsonResponse({ error: err.message }, err.status);
    console.error("Error al revocar token MCP:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
