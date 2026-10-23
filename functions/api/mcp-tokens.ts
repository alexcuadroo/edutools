import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { requireAuth, jsonResponse, AuthError } from "@/lib/auth";
import { createMcpToken, type McpTokenIndexRecord } from "@/lib/mcp-token";

const MAX_TOKENS_PER_USER = 5;

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    const { userId } = await requireAuth(context.request, context.env);

    if (context.request.method === "GET") {
      const list = await context.env.USERS.list({ prefix: `mcp-token-index:${userId}:` });
      const tokens: Omit<McpTokenIndexRecord, "tokenHash">[] = [];
      for (const key of list.keys) {
        const value = await context.env.USERS.get(key.name);
        if (!value) continue;
        const record = JSON.parse(value) as McpTokenIndexRecord;
        tokens.push({ id: record.id, name: record.name, createdAt: record.createdAt });
      }
      tokens.sort((a, b) => b.createdAt - a.createdAt);
      return jsonResponse(tokens, 200, { "Cache-Control": "no-store" });
    }

    if (context.request.method === "POST") {
      const current = await context.env.USERS.list({ prefix: `mcp-token-index:${userId}:`, limit: MAX_TOKENS_PER_USER });
      if (current.keys.length >= MAX_TOKENS_PER_USER) {
        return jsonResponse({ error: `Podés tener hasta ${MAX_TOKENS_PER_USER} tokens activos.` }, 409);
      }

      const body = await context.request.json().catch(() => ({})) as { name?: unknown };
      const name = typeof body.name === "string" ? body.name.trim() : "Mi conexión MCP";
      if (name.length < 1 || name.length > 50) {
        return jsonResponse({ error: "El nombre debe tener entre 1 y 50 caracteres." }, 400);
      }

      const { token, record } = await createMcpToken(context.env, userId, name);
      return jsonResponse({
        token,
        tokenInfo: { id: record.id, name: record.name, createdAt: record.createdAt },
      }, 201, { "Cache-Control": "no-store" });
    }

    return jsonResponse({ error: "Method Not Allowed" }, 405, { Allow: "GET, POST, OPTIONS" });
  } catch (err) {
    if (err instanceof AuthError) return jsonResponse({ error: err.message }, err.status);
    console.error("Error en mcp tokens:", err);
    return jsonResponse({ error: "Error interno del servidor" }, 500);
  }
};
