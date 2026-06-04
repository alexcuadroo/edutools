import type { Env } from "./index";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id;

    if (!id || typeof id !== "string" || id.length < 4 || id.length > 20) {
      return Response.json(
        { error: "ID de puzzle no válido" },
        { status: 400, headers: corsHeaders }
      );
    }

    const value = await context.env.PUZZLES.get(id);

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
