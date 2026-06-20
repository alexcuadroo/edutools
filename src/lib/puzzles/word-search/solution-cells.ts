import { WS_DIRECTIONS, type WSDirection } from "./types";
import type { WSGrid } from "./types";

export function getSolutionCells(grid: WSGrid): Set<string> {
  const cells = new Set<string>();
  for (const w of grid.words) {
    const d = WS_DIRECTIONS[w.direction as WSDirection];
    for (let i = 0; i < w.word.length; i++) {
      cells.add(`${w.startRow + d[0] * i},${w.startCol + d[1] * i}`);
    }
  }
  return cells;
}
