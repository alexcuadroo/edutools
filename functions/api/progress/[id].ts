import type { Env } from "@/lib/env";
import { corsHeaders } from "@/lib/env";
import { jsonResponse } from "@/lib/auth";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const id = context.params.id;
  if (typeof id !== "string" || !/^[a-f0-9]{8}$/i.test(id)) return jsonResponse({ error: "ID inválido" }, 400);
  if (!context.env.PROGRESS) return jsonResponse({ error: "Seguimiento no configurado" }, 503);
  const body = await context.request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.participantId !== "string" || typeof body.alias !== "string" || !["word-search", "crossword", "rosco"].includes(String(body.type)) || !Array.isArray(body.correctItems) || (body.incorrectItems !== undefined && !Array.isArray(body.incorrectItems)) || typeof body.total !== "number" || typeof body.completed !== "boolean") return jsonResponse({ error: "Progreso inválido" }, 400);
  const puzzle = await context.env.PUZZLES.get(id);
  if (!puzzle) return jsonResponse({ error: "Puzzle no encontrado" }, 404);
  const stub = context.env.PROGRESS.get(context.env.PROGRESS.idFromName(`puzzle:${id}`));
  const response = await stub.fetch("https://progress/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, incorrectItems: body.incorrectItems ?? [] }) });
  return new Response(null, { status: response.status, headers: corsHeaders });
};
