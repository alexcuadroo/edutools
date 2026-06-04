export interface HangmanWord {
  word: string;
  clue?: string;
}

export interface HangmanResult {
  words: HangmanWord[];
  maxAttempts: number;
}
