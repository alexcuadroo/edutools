import type { PlayablePuzzleType } from "@/lib/share/types";
import { getCachedId, setCachedId } from "@/lib/share/cache";

export interface PuzzlePayload {
  type: PlayablePuzzleType;
  puzzle: unknown;
}

export interface CreatePuzzleResponse {
  id: string;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + canonicalize((value as Record<string, unknown>)[k]))
      .join(",") +
    "}"
  );
}

export async function getPuzzleId(type: PlayablePuzzleType, puzzle: unknown): Promise<string> {
  const hashSource = canonicalize({ type, puzzle });
  const buffer = new TextEncoder().encode(hashSource);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < 4; i++) {
    hex += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  }
  return hex;
}

export async function savePuzzle(data: PuzzlePayload): Promise<string> {
  const id = await getPuzzleId(data.type, data.puzzle);

  const cached = getCachedId(id);
  if (cached) return cached;

  const response = await fetch("/api/puzzles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, id }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  const result: CreatePuzzleResponse = await response.json();
  setCachedId(id, result.id);
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
