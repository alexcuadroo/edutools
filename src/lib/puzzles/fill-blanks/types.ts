export interface TextToken {
  type: "word" | "punctuation" | "space";
  value: string;
  index: number;
}

export interface BlankWord {
  word: string;
  tokenIndex: number;
}

export interface FillBlanksResult {
  tokens: TextToken[];
  blanks: BlankWord[];
  options: string[];
  originalText: string;
}

export interface FillBlanksInput {
  text: string;
  blankCount: number;
  distractorRatio?: number;
}
