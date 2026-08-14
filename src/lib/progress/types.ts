export type ProgressPuzzleType = "word-search" | "crossword" | "rosco";

export interface ProgressSnapshot {
  correctItems: string[];
  incorrectItems?: string[];
  total: number;
  completed: boolean;
}

export interface ProgressEntry extends ProgressSnapshot {
  participantId: string;
  alias: string;
  type: ProgressPuzzleType;
  incorrectItems: string[];
  updatedAt: number;
}
