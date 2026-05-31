import type { WSGrid } from "../puzzles/word-search/types";
import { WS_DIRECTIONS, type WSDirection } from "../puzzles/word-search/types";

function getSolutionCells(grid: WSGrid): Set<string> {
  const cells = new Set<string>();
  for (const w of grid.words) {
    const d = WS_DIRECTIONS[w.direction as WSDirection];
    for (let i = 0; i < w.word.length; i++) {
      cells.add(`${w.startRow + d[0] * i},${w.startCol + d[1] * i}`);
    }
  }
  return cells;
}

export function downloadWordSearchPNG(
  grid: WSGrid,
  mode: "students" | "solution"
) {
  const cellSize = 32;
  const padding = 8;
  const solution = mode === "solution" ? getSolutionCells(grid) : new Set<string>();

  const wordListHeight = padding + grid.words.length * 14 + 20;

  const width = grid.size * cellSize + padding * 2;
  const height = grid.size * cellSize + padding * 2 + wordListHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.font = `${cellSize * 0.68}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      const x = padding + c * cellSize;
      const y = padding + r * cellSize;

      if (solution.has(`${r},${c}`)) {
        ctx.fillStyle = "#dbeafe";
        ctx.fillRect(x, y, cellSize, cellSize);
      }

      ctx.strokeStyle = "#c0c0c0";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellSize, cellSize);

      ctx.fillStyle = "#000000";
      ctx.fillText(grid.grid[r][c], x + cellSize / 2, y + cellSize / 2);
    }
  }

  const listY = padding + grid.size * cellSize + padding;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#333333";
  for (let i = 0; i < grid.words.length; i++) {
    ctx.fillText(grid.words[i].word, padding, listY + i * 14);
  }

  const filename =
    mode === "solution" ? "sopa-de-letras-solucion.png" : "sopa-de-letras.png";

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
