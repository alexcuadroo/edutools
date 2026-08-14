import type { PlayablePuzzleType } from "@/lib/share/types";

export const PUZZLE_TYPE_TO_SLUG: Record<PlayablePuzzleType, string> = {
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

export const SLUG_TO_PUZZLE_TYPE: Record<string, PlayablePuzzleType> = Object.fromEntries(
  Object.entries(PUZZLE_TYPE_TO_SLUG).map(([k, v]) => [v, k as PlayablePuzzleType])
);

export const PUZZLE_TYPE_LABELS: Record<PlayablePuzzleType, string> = {
  "word-search": "Sopa de Letras",
  "crossword": "Crucigrama",
  "fill-blanks": "Rellenar Huecos",
  "hangman": "Adivina la Palabra",
  "anagram": "Anagrama",
  "sentence-order": "Ordenar Oración",
  "match-columns": "Relacionar Columnas",
  "memory": "Memoria",
  "rosco": "Rosco",
};

export function puzzleTypeSlug(type: PlayablePuzzleType): string {
  return PUZZLE_TYPE_TO_SLUG[type] ?? type;
}

export function slugToPuzzleType(slug: string): PlayablePuzzleType | undefined {
  return SLUG_TO_PUZZLE_TYPE[slug];
}

export function puzzleTypeLabel(type: string): string {
  return PUZZLE_TYPE_LABELS[type as PlayablePuzzleType] ?? type;
}
