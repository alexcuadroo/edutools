import { create } from "zustand";

interface PuzzleState {
  activeTab: "word-search" | "crossword";
  setActiveTab: (tab: "word-search" | "crossword") => void;

  wordSearchTitle: string;
  setWordSearchTitle: (t: string) => void;
  wordSearchWords: { word: string; clue: string }[];
  setWordSearchWords: (words: { word: string; clue: string }[]) => void;
  wordSearchResult: unknown;
  setWordSearchResult: (result: unknown) => void;

  crosswordTitle: string;
  setCrosswordTitle: (t: string) => void;
  crosswordWords: { word: string; clue: string }[];
  setCrosswordWords: (words: { word: string; clue: string }[]) => void;
  crosswordResult: unknown;
  setCrosswordResult: (result: unknown) => void;

  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
}

export const usePuzzleStore = create<PuzzleState>((set) => ({
  activeTab: "word-search",
  setActiveTab: (tab) => set({ activeTab: tab, error: null }),

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

  loading: false,
  setLoading: (v) => set({ loading: v }),
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
