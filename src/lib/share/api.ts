import type { PlayablePuzzleType } from "./types";

export interface PuzzlePayload {
  type: PlayablePuzzleType;
  puzzle: unknown;
}

export interface CreatePuzzleResponse {
  id: string;
}

export async function savePuzzle(data: PuzzlePayload): Promise<string> {
  const response = await fetch("/api/puzzles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  const result: CreatePuzzleResponse = await response.json();
  return result.id;
}

export async function loadPuzzle(id: string): Promise<PuzzlePayload> {
  const response = await fetch(`/api/puzzles/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Puzzle no encontrado");
    }
    const error = await response.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  const data = await response.json();
  return data as PuzzlePayload;
}

export function buildPlayUrl(puzzleType: string, id: string, origin?: string): string {
  const base = origin ?? window.location.origin;
  return `${base}/jugar/${puzzleType}/${id}`;
}
