export interface CWGrid {
  grid: (string | null)[][];
  rows: number;
  cols: number;
  words: CWWord[];
  numbers: Map<string, number>;
}

export interface CWWord {
  word: string;
  clue: string;
  number: number;
  direction: "across" | "down";
  startRow: number;
  startCol: number;
}
