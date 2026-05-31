import { create } from "zustand";

interface PuzzleState {
  activeTab: "word-search" | "crossword";
  setActiveTab: (tab: "word-search" | "crossword") => void;

  wordSearchWords: { word: string; clue: string }[];
  setWordSearchWords: (words: { word: string; clue: string }[]) => void;
  wordSearchResult: unknown;
  setWordSearchResult: (result: unknown) => void;

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

  wordSearchWords: [],
  setWordSearchWords: (words) => set({ wordSearchWords: words }),
  wordSearchResult: null,
  setWordSearchResult: (result) => set({ wordSearchResult: result }),

  crosswordWords: [],
  setCrosswordWords: (words) => set({ crosswordWords: words }),
  crosswordResult: null,
  setCrosswordResult: (result) => set({ crosswordResult: result }),

  loading: false,
  setLoading: (v) => set({ loading: v }),
  error: null,
  setError: (e) => set({ error: e }),
}));
