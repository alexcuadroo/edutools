export interface AnagramWord {
  word: string;
  clue?: string;
  scrambled: string;
}

export interface AnagramResult {
  words: AnagramWord[];
}
