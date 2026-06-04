import type { Env } from "../utils";
import { corsHeaders } from "../utils";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const idParam = context.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const normalizedId = id?.toLowerCase();

    if (!normalizedId || typeof normalizedId !== "string" || normalizedId.length < 4 || normalizedId.length > 20) {
      return Response.json(
        { error: "ID de puzzle no válido" },
        { status: 400, headers: corsHeaders }
      );
    }

    const value = await context.env.PUZZLES.get(normalizedId);

    if (!value) {
      return Response.json(
        { error: "Puzzle no encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(value);
    } catch {
      return Response.json(
        { error: "Datos del puzzle corruptos" },
        { status: 500, headers: corsHeaders }
      );
    }

    return Response.json(data, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Error fetching puzzle:", err);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: corsHeaders }
    );
  }
};
