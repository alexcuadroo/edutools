import type { AllowedPuzzleType } from "./env";

export const PUZZLE_TYPE_TO_SLUG: Record<AllowedPuzzleType, string> = {
  "word-search": "sopa-de-letras",
  "crossword": "crucigrama",
  "fill-blanks": "rellenar-huecos",
  "hangman": "adivina-la-palabra",
  "anagram": "anagrama",
  "sentence-order": "ordenar-oracion",
  "match-columns": "relacionar-columnas",
  "memory": "memoria",
  "rosco": "rosco",
};

export const SLUG_TO_PUZZLE_TYPE: Record<string, AllowedPuzzleType> = Object.fromEntries(
  Object.entries(PUZZLE_TYPE_TO_SLUG).map(([k, v]) => [v, k as AllowedPuzzleType])
);

export function puzzleTypeSlug(type: AllowedPuzzleType): string {
  return PUZZLE_TYPE_TO_SLUG[type] ?? type;
}

export function slugToPuzzleType(slug: string): AllowedPuzzleType | undefined {
  return SLUG_TO_PUZZLE_TYPE[slug];
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

export async function getPuzzleId(type: string, puzzle: unknown): Promise<string> {
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

export function buildPlayUrl(puzzleType: AllowedPuzzleType, id: string, origin?: string): string {
  const base = origin ?? "https://tools.edualex.uy";
  return `${base}/jugar/${puzzleTypeSlug(puzzleType)}/${id}`;
}
