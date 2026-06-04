import type { WSWordPlacement } from "../puzzles/word-search/types";
import type { CWWord } from "../puzzles/crossword/types";

export interface WSPlayData {
  g: string[][];
  s: number;
  w: { w: string; c?: string; r: number; col: number; d: string }[];
  t?: string;
}

export interface CWPlayData {
  g: (string | null)[][];
  r: number;
  c: number;
  w: { w: string; c: string; n: number; d: "across" | "down"; r: number; col: number }[];
  n: Record<string, number>;
  t?: string;
}

export type PlayablePuzzleType = "word-search" | "crossword";

export interface PlayableWSWord {
  word: string;
  clue?: string;
  startRow: number;
  startCol: number;
  direction: string;
}

export interface PlayableCWWord {
  word: string;
  clue: string;
  number: number;
  direction: "across" | "down";
  startRow: number;
  startCol: number;
}

export function wsGridToPlayData(
  grid: { grid: string[][]; size: number; words: WSWordPlacement[] },
  title?: string
): WSPlayData {
  return {
    g: grid.grid,
    s: grid.size,
    w: grid.words.map((word) => ({
      w: word.word,
      c: word.clue,
      r: word.startRow,
      col: word.startCol,
      d: word.direction,
    })),
    t: title || undefined,
  };
}

export function cwGridToPlayData(
  grid: {
    grid: (string | null)[][];
    rows: number;
    cols: number;
    words: CWWord[];
    numbers: Map<string, number>;
  },
  title?: string
): CWPlayData {
  const numbersObj: Record<string, number> = {};
  for (const [key, val] of grid.numbers) {
    numbersObj[key] = val;
  }

  return {
    g: grid.grid,
    r: grid.rows,
    c: grid.cols,
    w: grid.words.map((word) => ({
      w: word.word,
      c: word.clue,
      n: word.number,
      d: word.direction,
      r: word.startRow,
      col: word.startCol,
    })),
    n: numbersObj,
    t: title || undefined,
  };
}

export function playDataToWSWords(data: WSPlayData): PlayableWSWord[] {
  return data.w.map((word) => ({
    word: word.w,
    clue: word.c,
    startRow: word.r,
    startCol: word.col,
    direction: word.d,
  }));
}

export function playDataToCWWords(data: CWPlayData): PlayableCWWord[] {
  return data.w.map((word) => ({
    word: word.w,
    clue: word.c,
    number: word.n,
    direction: word.d,
    startRow: word.r,
    startCol: word.col,
  }));
}

export function playDataToCWNumbers(data: CWPlayData): Map<string, number> {
  const map = new Map<string, number>();
  for (const [key, val] of Object.entries(data.n)) {
    map.set(key, val);
  }
  return map;
}
