export interface WSGrid {
  grid: string[][];
  size: number;
  words: WSWordPlacement[];
}

export interface WSWordPlacement {
  word: string;
  clue?: string;
  startRow: number;
  startCol: number;
  direction: string;
}

export type WSDirection = "right" | "down" | "diag-down-right" | "diag-up-right" | "left" | "up" | "diag-down-left" | "diag-up-left";

export const WS_DIRECTIONS: Record<WSDirection, [number, number]> = {
  right: [0, 1],
  down: [1, 0],
  "diag-down-right": [1, 1],
  "diag-up-right": [-1, 1],
  left: [0, -1],
  up: [-1, 0],
  "diag-down-left": [1, -1],
  "diag-up-left": [-1, -1],
};

export const WS_DIRECTION_LABELS: Record<WSDirection, string> = {
  right: "→",
  down: "↓",
  "diag-down-right": "↘",
  "diag-up-right": "↗",
  left: "←",
  up: "↑",
  "diag-down-left": "↙",
  "diag-up-left": "↖",
};
