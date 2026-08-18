import type { WSWordPlacement } from "@/lib/puzzles/word-search/types";
import type { CWWord } from "@/lib/puzzles/crossword/types";
import type { FillBlanksResult } from "@/lib/puzzles/fill-blanks/types";
import type { HangmanResult } from "@/lib/puzzles/hangman/types";
import type { AnagramResult } from "@/lib/puzzles/anagram/types";
import type { SentenceOrderResult } from "@/lib/puzzles/sentence-order/types";
import type { MCResult } from "@/lib/puzzles/match-columns/types";
import type { MemoryResult } from "@/lib/puzzles/memory/types";
import type { RoscoResult } from "@/lib/puzzles/rosco/types";
import type { WordleResult } from "@/lib/puzzles/wordle/types";

export type PlayablePuzzleType = "word-search" | "crossword" | "fill-blanks" | "hangman" | "anagram" | "sentence-order" | "match-columns" | "memory" | "rosco" | "wordle";

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

export interface FBPlayData {
  t?: string;
  txt: string;
  b: { i: number; w: string }[];
  o: string[];
}

export interface HangmanPlayData {
  t?: string;
  w: { w: string; c?: string }[];
  m: number;
}

export interface AnagramPlayData {
  t?: string;
  w: { w: string; c?: string; s: string }[];
}

export interface SOPlayData {
  t?: string;
  s: { o: string; w: string[] }[];
}

export function fillBlanksResultToPlayData(result: FillBlanksResult, title?: string): FBPlayData {
  return {
    t: title || undefined,
    txt: result.originalText,
    b: result.blanks.map((b) => ({ i: b.tokenIndex, w: b.word })),
    o: result.options,
  };
}

export function hangmanResultToPlayData(result: HangmanResult, title?: string): HangmanPlayData {
  return {
    t: title || undefined,
    w: result.words.map((w) => ({ w: w.word, c: w.clue })),
    m: result.maxAttempts,
  };
}

export function anagramResultToPlayData(result: AnagramResult, title?: string): AnagramPlayData {
  return {
    t: title || undefined,
    w: result.words.map((w) => ({ w: w.word, c: w.clue, s: w.scrambled })),
  };
}

export function sentenceOrderResultToPlayData(result: SentenceOrderResult, title?: string): SOPlayData {
  return {
    t: title || undefined,
    s: result.sentences.map((s) => ({ o: s.original, w: s.shuffled })),
  };
}

export interface MCPlayData {
  t?: string;
  m: { w: string; d: string }[];
  sd: string[];
}

export function matchColumnsResultToPlayData(result: MCResult, title?: string): MCPlayData {
  return {
    t: title || undefined,
    m: result.matches.map((p) => ({ w: p.word, d: p.definition })),
    sd: result.shuffledDefinitions,
  };
}

export interface MemPlayData {
  t?: string;
  c: { id: string; p: number; ct: string; ty: "w" | "d" }[];
  p: { w: string; d: string }[];
}

export function memoryResultToPlayData(result: MemoryResult, title?: string): MemPlayData {
  return {
    t: title || undefined,
    c: result.cards.map((card) => ({ id: card.id, p: card.pairId, ct: card.content, ty: card.type === "word" ? "w" : "d" })),
    p: result.pairs.map((pair) => ({ w: pair.word, d: pair.definition })),
  };
}

export interface RoscoPlayData {
  t?: string;
  d: number;
  e: { l: string; a: string; c: string; r: "starts-with" | "contains" }[];
}

export function roscoResultToPlayData(result: RoscoResult, title?: string): RoscoPlayData {
  return {
    t: title || undefined,
    d: result.durationSeconds,
    e: result.entries.map((entry) => ({
      l: entry.letter,
      a: entry.answer,
      c: entry.clue,
      r: entry.rule,
    })),
  };
}

export interface WordlePlayData { t?: string; w: string; c?: string; p?: { w: string; c?: string }[]; }

export function wordleResultToPlayData(result: WordleResult, title?: string): WordlePlayData {
  const first = result.words[0]!;
  return { t: title || undefined, w: first.word, c: first.clue, p: result.words.map((entry) => ({ w: entry.word, c: entry.clue })) };
}
