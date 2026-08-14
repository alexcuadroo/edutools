import type { PlayablePuzzleType } from "@/lib/share/types";

const STORAGE_KEY = "edutools_pending_puzzle_save";

export interface PendingPuzzleSave {
  type: PlayablePuzzleType;
  title: string;
  data: unknown;
}

const PLAYABLE_TYPES: PlayablePuzzleType[] = [
  "word-search", "crossword", "fill-blanks", "hangman", "anagram", "sentence-order", "match-columns", "memory", "rosco",
];

export function parsePendingPuzzleSave(value: string | null): PendingPuzzleSave | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    if (!PLAYABLE_TYPES.includes(record.type as PlayablePuzzleType) || typeof record.title !== "string" || !("data" in record)) return null;
    return { type: record.type as PlayablePuzzleType, title: record.title, data: record.data };
  } catch {
    return null;
  }
}

export function setPendingPuzzleSave(puzzle: PendingPuzzleSave): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(puzzle));
}

export function getPendingPuzzleSave(): PendingPuzzleSave | null {
  return parsePendingPuzzleSave(sessionStorage.getItem(STORAGE_KEY));
}

export function clearPendingPuzzleSave(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
