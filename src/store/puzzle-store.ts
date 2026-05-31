import { create } from "zustand";
import type { WordItem } from "../lib/puzzles/shared-types";
import type { WSGrid } from "../lib/puzzles/word-search/types";
import type { CWGrid } from "../lib/puzzles/crossword/types";

interface PuzzleState {
  wordSearchTitle: string;
  setWordSearchTitle: (t: string) => void;
  wordSearchWords: WordItem[];
  setWordSearchWords: (words: WordItem[]) => void;
  wordSearchResult: WSGrid | null;
  setWordSearchResult: (result: WSGrid | null) => void;

  crosswordTitle: string;
  setCrosswordTitle: (t: string) => void;
  crosswordWords: WordItem[];
  setCrosswordWords: (words: WordItem[]) => void;
  crosswordResult: CWGrid | null;
  setCrosswordResult: (result: CWGrid | null) => void;

  error: string | null;
  setError: (e: string | null) => void;
}

export const usePuzzleStore = create<PuzzleState>((set) => ({
  wordSearchTitle: "",
  setWordSearchTitle: (title) => set({ wordSearchTitle: title }),
  wordSearchWords: [],
  setWordSearchWords: (words) => set({ wordSearchWords: words }),
  wordSearchResult: null,
  setWordSearchResult: (result) => set({ wordSearchResult: result }),

  crosswordTitle: "",
  setCrosswordTitle: (title) => set({ crosswordTitle: title }),
  crosswordWords: [],
  setCrosswordWords: (words) => set({ crosswordWords: words }),
  crosswordResult: null,
  setCrosswordResult: (result) => set({ crosswordResult: result }),

  error: null,
  setError: (e) => set({ error: e }),
}));

export function sanitizeFilename(title: string, fallback: string): string {
  const cleaned = title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 60);

  return cleaned || fallback;
}
