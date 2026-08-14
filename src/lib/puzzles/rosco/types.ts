export const ROSCO_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export type RoscoRule = "starts-with" | "contains";

export interface RoscoEntry {
  letter: string;
  answer: string;
  clue: string;
  rule: RoscoRule;
}

export interface RoscoResult {
  entries: RoscoEntry[];
  durationSeconds: number;
}

export interface RoscoPuzzleInput {
  entries: RoscoEntry[];
  durationSeconds: number;
}
