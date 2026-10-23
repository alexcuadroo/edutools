import type { Env, AllowedPuzzleType } from "@/lib/env";
import { ALLOWED_PUZZLE_TYPES } from "@/lib/env";
import { getPuzzleId, buildPlayUrl } from "@/lib/puzzle-id";
import type { SavedPuzzleRecord } from "@/lib/types";
import { authenticateMcpToken } from "@/lib/mcp-token";
import { generatePlayablePuzzle } from "@/lib/puzzle-generation";

const MCP_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, MCP-Protocol-Version",
  "Cache-Control": "no-store",
};
const MAX_DATA_SIZE = 100 * 1024;
const PROTOCOL_VERSIONS = new Set(["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"]);

const PUZZLE_LINK_TOOL = {
  name: "save_puzzle",
  title: "Generar puzzle, guardarlo y obtener enlace",
  description: [
    "Genera el puzzle en el servidor usando los generadores de EduTools, lo guarda en la cuenta autenticada y devuelve el enlace para jugar.",
    "No envíes la cuadrícula ni datos compactos de reproducción: envía las palabras/pistas originales en input.words.",
    "Para word-search: input.words puede ser texto con una palabra por línea o [{word, clue?}]; pistas opcionales con el formato PALABRA - PISTA. size opcional (5-30, por defecto 15).",
    "Para crossword, hangman, anagram, match-columns y memory: input.words puede ser texto por líneas o [{word, clue?}].",
    "Para sentence-order: input.words [{word: oración}] (mínimo 3 palabras por oración).",
    "Para fill-blanks: input.text y input.blankCount.",
    "Para rosco: input.entries con 26 objetos {letter, answer, clue, rule} y input.durationSeconds; rule es starts-with o contains.",
    "Para wordle: input.words [{word, clue?}].",
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      type: { type: "string", enum: ALLOWED_PUZZLE_TYPES, description: "Tipo de puzzle de EduTools." },
      title: { type: "string", minLength: 1, maxLength: 120, description: "Título visible del puzzle." },
      input: {
        type: "object",
        description: "Entradas originales para el generador. Usa solo los campos requeridos por el tipo de puzzle.",
        properties: {
          words: {
            anyOf: [
              {
                type: "string",
                maxLength: 10000,
                description: "Una palabra u oración por línea. Para incluir pista, usa PALABRA - PISTA.",
              },
              {
                type: "array",
                minItems: 1,
                maxItems: 100,
                description: "Lista estructurada de palabras u oraciones.",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string", minLength: 1, maxLength: 200 },
                    clue: { type: "string" },
                  },
                  required: ["word"],
                  additionalProperties: false,
                },
              },
            ],
          },
          size: { type: "integer", minimum: 5, maximum: 30, description: "Tamaño de la sopa de letras; opcional." },
          text: { type: "string", maxLength: 10000, description: "Texto original para rellenar huecos." },
          blankCount: { type: "integer", minimum: 1, maximum: 100 },
          entries: {
            type: "array",
            minItems: 26,
            maxItems: 26,
            description: "Las 26 entradas del rosco, ordenadas de A a Z.",
            items: {
              type: "object",
              properties: {
                letter: { type: "string" },
                answer: { type: "string" },
                clue: { type: "string" },
                rule: { type: "string", enum: ["starts-with", "contains"] },
              },
              required: ["letter", "answer", "clue", "rule"],
              additionalProperties: false,
            },
          },
          durationSeconds: { type: "integer", minimum: 10, maximum: 3600 },
        },
        additionalProperties: false,
      },
    },
    required: ["type", "title", "input"],
    additionalProperties: false,
  },
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: MCP_HEADERS });

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: MCP_HEADERS });
  }
  if (context.request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, {
      status: 405,
      headers: { ...MCP_HEADERS, Allow: "POST, OPTIONS" },
    });
  }

  const auth = await authenticateMcpToken(context.env, context.request.headers.get("Authorization"));
  if (!auth) {
    return Response.json({ error: "Token MCP inválido o revocado" }, {
      status: 401,
      headers: { ...MCP_HEADERS, "WWW-Authenticate": "Bearer" },
    });
  }

  const contentLength = Number(context.request.headers.get("Content-Length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_DATA_SIZE + 16 * 1024) {
    return rpcError(null, -32600, "Request demasiado grande", 413);
  }

  let message: unknown;
  try {
    message = await context.request.json();
  } catch {
    return rpcError(null, -32700, "JSON inválido", 400);
  }

  if (!isRecord(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return rpcError(isRecord(message) ? message.id : null, -32600, "Invalid Request", 400);
  }

  const hasId = Object.prototype.hasOwnProperty.call(message, "id");
  const id = hasId ? message.id : null;
  if (message.method === "notifications/initialized" || message.method === "notifications/cancelled") {
    return new Response(null, { status: 202, headers: MCP_HEADERS });
  }

  if (message.method === "initialize") {
    const requestedVersion = isRecord(message.params) && typeof message.params.protocolVersion === "string"
      ? message.params.protocolVersion
      : "2025-03-26";
    const protocolVersion = PROTOCOL_VERSIONS.has(requestedVersion) ? requestedVersion : "2025-03-26";
    return rpcResult(id, {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "edutools", title: "EduTools", version: "1.0.0" },
      instructions: "Usa save_puzzle con las palabras, pistas o el texto original. EduTools genera el puzzle, lo guarda en la cuenta y devuelve el enlace de juego.",
    });
  }

  if (message.method === "ping") return rpcResult(id, {});

  if (message.method === "tools/list") {
    return rpcResult(id, { tools: [PUZZLE_LINK_TOOL] });
  }

  if (message.method === "tools/call") {
    const params = isRecord(message.params) ? message.params : {};
    if (params.name !== "save_puzzle") {
      return rpcResult(id, toolError(`Herramienta desconocida: ${String(params.name ?? "")}`));
    }

    try {
      const url = await generateAndSavePuzzle(context.env, auth.userId, context.request, params.arguments);
      return rpcResult(id, {
        content: [{ type: "text", text: url }],
      });
    } catch (error) {
      return rpcResult(id, toolError(error instanceof Error ? error.message : "No se pudo guardar el puzzle"));
    }
  }

  if (!hasId) return new Response(null, { status: 202, headers: MCP_HEADERS });
  return rpcError(id, -32601, `Method not found: ${message.method}`);
};

async function generateAndSavePuzzle(
  env: Env,
  userId: string,
  request: Request,
  args: unknown,
): Promise<string> {
  if (!isRecord(args)) throw new Error("Los argumentos deben ser un objeto.");
  const { type, title } = args;
  if (typeof type !== "string" || !ALLOWED_PUZZLE_TYPES.includes(type as AllowedPuzzleType)) {
    throw new Error(`Tipo no válido. Tipos permitidos: ${ALLOWED_PUZZLE_TYPES.join(", ")}.`);
  }
  if (typeof title !== "string" || !title.trim() || title.trim().length > 120) {
    throw new Error("El título es obligatorio y debe tener como máximo 120 caracteres.");
  }
  const cleanTitle = title.trim();
  const data = generatePlayablePuzzle(type as AllowedPuzzleType, cleanTitle, args.input);

  const serialized = JSON.stringify(data);
  if (serialized.length > MAX_DATA_SIZE) throw new Error("El puzzle supera el límite de 100 KB.");

  const puzzleId = await getPuzzleId(type, data);
  const puzzleKey = `puzzle:${userId}:${puzzleId}`;
  const existingString = await env.USERS.get(puzzleKey);
  if (existingString) {
    const saved = JSON.parse(existingString) as SavedPuzzleRecord;
    if (saved.title !== cleanTitle) {
      saved.title = cleanTitle;
      saved.data = data;
      await env.USERS.put(puzzleKey, JSON.stringify(saved));
    }
  } else {
    const now = Date.now();
    const saved: SavedPuzzleRecord = {
      id: puzzleId,
      type,
      title: cleanTitle,
      data,
      createdAt: now,
      shareIds: [],
    };
    await env.USERS.put(puzzleKey, JSON.stringify(saved));
    await env.USERS.put(`puzzle-idx:${userId}:${now}:${puzzleId}`, puzzleId);
  }

  await env.PUZZLES.put(puzzleId, JSON.stringify({ type, puzzle: data, id: puzzleId }));
  return buildPlayUrl(type as AllowedPuzzleType, puzzleId, new URL(request.url).origin);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toolError(message: string) {
  return { content: [{ type: "text", text: message }], isError: true };
}

function rpcResult(id: unknown, result: unknown): Response {
  return Response.json({ jsonrpc: "2.0", id, result }, { status: 200, headers: MCP_HEADERS });
}

function rpcError(id: unknown, code: number, message: string, status = 200): Response {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { status, headers: MCP_HEADERS });
}
