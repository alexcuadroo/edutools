import type { Env, AllowedPuzzleType } from "@/lib/env";
import { corsHeaders, ALLOWED_PUZZLE_TYPES } from "@/lib/env";
import { requireAuth, jsonResponse, AuthError } from "@/lib/auth";
import { getPuzzleId, buildPlayUrl } from "@/lib/puzzle-id";
import type { SavedPuzzleRecord, SavedPuzzleMeta } from "@/lib/types";

const MAX_DATA_SIZE = 100 * 1024;

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const pathParam = context.params.path;
  const pathSegments = Array.isArray(pathParam)
    ? pathParam
    : pathParam
      ? [pathParam]
      : [];

  const method = context.request.method;

  if (pathSegments.length === 0) {
    if (method === "GET") return handleList(context);
    if (method === "POST") return handleSave(context);
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  const [id, action] = pathSegments;

  if (!id || typeof id !== "string") {
    return jsonResponse({ error: "ID inválido" }, 400);
  }

  if (action === "share") {
    if (method === "POST") return handleShare(context, id);
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  if (action) {
    return jsonResponse({ error: "Not Found" }, 404);
  }

  if (method === "GET") return handleGetOne(context, id);
  if (method === "DELETE") return handleDelete(context, id);
  return jsonResponse({ error: "Method Not Allowed" }, 405);
};

async function handleList(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  try {
    const { userId } = await requireAuth(context.request, context.env);
    const list = await context.env.USERS.list({ prefix: `puzzle-idx:${userId}:` });
    const metas: SavedPuzzleMeta[] = [];

    for (const key of list.keys) {
      const puzzleId = await context.env.USERS.get(key.name);
      if (!puzzleId) continue;
      const puzzleStr = await context.env.USERS.get(`puzzle:${userId}:${puzzleId}`);
      if (!puzzleStr) continue;
      const puzzle: SavedPuzzleRecord = JSON.parse(puzzleStr);
      metas.push({
        id: puzzle.id,
        type: puzzle.type,
        title: puzzle.title,
        createdAt: puzzle.createdAt,
        shareCount: puzzle.shareIds.length,
      });
    }

    metas.sort((a, b) => b.createdAt - a.createdAt);
    return jsonResponse(metas, 200);
  } catch (err) {
    return errorResponse(err, "Error en saved list");
  }
}

async function handleSave(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  try {
    const { userId } = await requireAuth(context.request, context.env);
    const body = await context.request.json();
    const { type, title, data } = body as { type?: unknown; title?: unknown; data?: unknown };

    if (typeof type !== "string" || !ALLOWED_PUZZLE_TYPES.includes(type as typeof ALLOWED_PUZZLE_TYPES[number])) {
      return jsonResponse({ error: "Tipo de puzzle no válido" }, 400);
    }
    if (typeof title !== "string" || title.trim().length === 0) {
      return jsonResponse({ error: "Título requerido" }, 400);
    }
    if (!data || typeof data !== "object") {
      return jsonResponse({ error: "Datos del puzzle requeridos" }, 400);
    }

    const serialized = JSON.stringify(data);
    if (serialized.length > MAX_DATA_SIZE) {
      return jsonResponse({ error: "Datos demasiado grandes (max 100KB)" }, 413);
    }

    const puzzleId = await getPuzzleId(type, data);
    const cleanTitle = title.trim();
    const puzzleKey = `puzzle:${userId}:${puzzleId}`;

    const existingStr = await context.env.USERS.get(puzzleKey);
    if (existingStr) {
      const existing: SavedPuzzleRecord = JSON.parse(existingStr);
      if (existing.title !== cleanTitle) {
        existing.title = cleanTitle;
        await context.env.USERS.put(puzzleKey, JSON.stringify(existing));
      }
      return jsonResponse({ id: puzzleId, existing: true }, 200);
    }

    const now = Date.now();
    const puzzle: SavedPuzzleRecord = {
      id: puzzleId,
      type,
      title: cleanTitle,
      data,
      createdAt: now,
      shareIds: [],
    };

    await context.env.USERS.put(puzzleKey, JSON.stringify(puzzle));
    await context.env.USERS.put(`puzzle-idx:${userId}:${now}:${puzzleId}`, puzzleId);

    return jsonResponse({ id: puzzleId, existing: false }, 201);
  } catch (err) {
    return errorResponse(err, "Error en saved save");
  }
}

async function handleGetOne(
  context: Parameters<PagesFunction<Env>>[0],
  id: string
): Promise<Response> {
  try {
    const { userId } = await requireAuth(context.request, context.env);
    const puzzleStr = await context.env.USERS.get(`puzzle:${userId}:${id}`);
    if (!puzzleStr) {
      return jsonResponse({ error: "Puzzle no encontrado" }, 404);
    }
    const puzzle: SavedPuzzleRecord = JSON.parse(puzzleStr);
    return jsonResponse({ type: puzzle.type, puzzle: puzzle.data }, 200);
  } catch (err) {
    return errorResponse(err, "Error en saved get");
  }
}

async function handleDelete(
  context: Parameters<PagesFunction<Env>>[0],
  id: string
): Promise<Response> {
  try {
    const { userId } = await requireAuth(context.request, context.env);
    const puzzleStr = await context.env.USERS.get(`puzzle:${userId}:${id}`);
    if (!puzzleStr) {
      return jsonResponse({ error: "Puzzle no encontrado" }, 404);
    }

    await context.env.USERS.delete(`puzzle:${userId}:${id}`);

    const idxList = await context.env.USERS.list({ prefix: `puzzle-idx:${userId}:` });
    for (const key of idxList.keys) {
      const storedId = await context.env.USERS.get(key.name);
      if (storedId === id) {
        await context.env.USERS.delete(key.name);
        break;
      }
    }

    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    return errorResponse(err, "Error en saved delete");
  }
}

async function handleShare(
  context: Parameters<PagesFunction<Env>>[0],
  id: string
): Promise<Response> {
  try {
    const { userId } = await requireAuth(context.request, context.env);
    const puzzleStr = await context.env.USERS.get(`puzzle:${userId}:${id}`);
    if (!puzzleStr) {
      return jsonResponse({ error: "Puzzle no encontrado" }, 404);
    }

    const puzzle: SavedPuzzleRecord = JSON.parse(puzzleStr);
    const shareId = await getPuzzleId(puzzle.type, puzzle.data);

    const existing = await context.env.PUZZLES.get(shareId);
    if (!existing) {
      const payload = JSON.stringify({
        type: puzzle.type,
        puzzle: puzzle.data,
        id: shareId,
      });
      await context.env.PUZZLES.put(shareId, payload, { expirationTtl: 86400 });
    }

    if (!puzzle.shareIds.includes(shareId)) {
      puzzle.shareIds.push(shareId);
      await context.env.USERS.put(`puzzle:${userId}:${id}`, JSON.stringify(puzzle));
    }

    const url = buildPlayUrl(puzzle.type as AllowedPuzzleType, shareId);
    return jsonResponse({ shareId, url }, 200);
  } catch (err) {
    return errorResponse(err, "Error en saved share");
  }
}

function errorResponse(err: unknown, label: string): Response {
  if (err instanceof AuthError) {
    return jsonResponse({ error: err.message }, err.status);
  }
  console.error(label, err);
  return jsonResponse({ error: "Error interno del servidor" }, 500);
}
