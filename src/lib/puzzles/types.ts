export type PuzzleType = "word-search" | "crossword" | "fill-blanks" | "hangman";

export interface PuzzleInput {
  words: { word: string; clue?: string }[];
  size?: number;
}

export interface PuzzleResult {
  type: PuzzleType;
  grid: unknown;
  words: { word: string; clue?: string }[];
}

export interface IPuzzleGenerator {
  id: PuzzleType;
  name: string;
  description: string;
  generate(input: PuzzleInput): PuzzleResult;
}
