export interface WordlePuzzleInput {
  word: string;
  clue?: string;
}

export interface WordleEntry { word: string; clue?: string; }

export interface WordleResult {
  words: WordleEntry[];
}
