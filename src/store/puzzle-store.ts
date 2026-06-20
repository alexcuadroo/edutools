import { create } from "zustand";
import type { WordItem } from "../lib/puzzles/shared-types";
import type { WSGrid } from "../lib/puzzles/word-search/types";
import type { CWGrid } from "../lib/puzzles/crossword/types";
import type { FillBlanksResult } from "../lib/puzzles/fill-blanks/types";
import type { HangmanResult } from "../lib/puzzles/hangman/types";
import type { AnagramResult } from "../lib/puzzles/anagram/types";
import type { SentenceOrderResult } from "../lib/puzzles/sentence-order/types";

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

  fillBlanksTitle: string;
  setFillBlanksTitle: (t: string) => void;
  fillBlanksResult: FillBlanksResult | null;
  setFillBlanksResult: (result: FillBlanksResult | null) => void;

  hangmanTitle: string;
  setHangmanTitle: (t: string) => void;
  hangmanResult: HangmanResult | null;
  setHangmanResult: (result: HangmanResult | null) => void;

  anagramTitle: string;
  setAnagramTitle: (t: string) => void;
  anagramResult: AnagramResult | null;
  setAnagramResult: (result: AnagramResult | null) => void;

  sentenceOrderTitle: string;
  setSentenceOrderTitle: (t: string) => void;
  sentenceOrderResult: SentenceOrderResult | null;
  setSentenceOrderResult: (result: SentenceOrderResult | null) => void;

  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;

  activeTab: "word-search" | "crossword" | "fill-blanks" | "hangman" | "anagram" | "sentence-order";
  setActiveTab: (tab: "word-search" | "crossword" | "fill-blanks" | "hangman" | "anagram" | "sentence-order") => void;
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

  fillBlanksTitle: "",
  setFillBlanksTitle: (title) => set({ fillBlanksTitle: title }),
  fillBlanksResult: null,
  setFillBlanksResult: (result) => set({ fillBlanksResult: result }),

  hangmanTitle: "",
  setHangmanTitle: (title) => set({ hangmanTitle: title }),
  hangmanResult: null,
  setHangmanResult: (result) => set({ hangmanResult: result }),

  anagramTitle: "",
  setAnagramTitle: (title) => set({ anagramTitle: title }),
  anagramResult: null,
  setAnagramResult: (result) => set({ anagramResult: result }),

  sentenceOrderTitle: "",
  setSentenceOrderTitle: (title) => set({ sentenceOrderTitle: title }),
  sentenceOrderResult: null,
  setSentenceOrderResult: (result) => set({ sentenceOrderResult: result }),

  loading: false,
  setLoading: (v) => set({ loading: v }),
  error: null,

  activeTab: "word-search",
  setActiveTab: (tab) => set({ activeTab: tab, error: null }),
  setError: (e) => set({ error: e }),
}));


