export type PuzzleType = "word-search" | "crossword" | "fill-blanks" | "hangman" | "anagram" | "sentence-order" | "match-columns" | "memory" | "rosco" | "wordle";

export interface PuzzleInput {
  words: { word: string; clue?: string }[];
  size?: number;
  entries?: RoscoEntry[];
  durationSeconds?: number;
}

export interface PuzzleResult<GridType = unknown> {
  type: PuzzleType;
  grid: GridType;
  words: { word: string; clue?: string }[];
}

export interface IPuzzleGenerator<GridType = unknown> {
  id: PuzzleType;
  name: string;
  description: string;
  generate(input: PuzzleInput): PuzzleResult<GridType>;
}
import type { RoscoEntry } from "@/lib/puzzles/rosco/types";
