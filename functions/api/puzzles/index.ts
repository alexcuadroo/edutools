import type { Env } from "../utils";
import { corsHeaders } from "../utils";

const MAX_PAYLOAD_SIZE = 100 * 1024;
const ALLOWED_TYPES = [
  "word-search",
  "crossword",
  "fill-blanks",
  "hangman",
  "anagram",
  "sentence-order",
  "match-columns",
  "memory",
] as const;

function generateShortId(): string {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 8);
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const contentType = context.request.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      return Response.json(
        { error: "Content-Type debe ser application/json" },
        { status: 400, headers: corsHeaders }
      );
    }

    const contentLength = context.request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return Response.json(
        { error: "Payload demasiado grande (max 100KB)" },
        { status: 413, headers: corsHeaders }
      );
    }

    let body: unknown;
    try {
      body = await context.request.json();
    } catch {
      return Response.json(
        { error: "JSON inválido" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { error: "Body debe ser un objeto JSON" },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = body as Record<string, unknown>;

    if (!data.type || typeof data.type !== "string") {
      return Response.json(
        { error: "Campo 'type' es requerido" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!ALLOWED_TYPES.includes(data.type as typeof ALLOWED_TYPES[number])) {
      return Response.json(
        { error: `Tipo de puzzle no válido. Permitidos: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!data.puzzle || typeof data.puzzle !== "object") {
      return Response.json(
        { error: "Campo 'puzzle' es requerido y debe ser un objeto" },
        { status: 400, headers: corsHeaders }
      );
    }

    const jsonString = JSON.stringify(data);
    if (jsonString.length > MAX_PAYLOAD_SIZE) {
      return Response.json(
        { error: "Payload demasiado grande (max 100KB)" },
        { status: 413, headers: corsHeaders }
      );
    }

    const id = generateShortId();

    await context.env.PUZZLES.put(id, jsonString, {
      expirationTtl: 60 * 60 * 24,
    });

    return Response.json({ id }, { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error("Error creating puzzle:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: corsHeaders }
    );
  }
};
