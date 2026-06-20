import type { WSGrid } from "@/lib/puzzles/word-search/types";
import { getSolutionCells } from "@/lib/puzzles/word-search/solution-cells";
import { sanitizeFilename } from "@/lib/utils";

export function downloadWordSearchPNG(
  grid: WSGrid,
  mode: "students" | "solution",
  title?: string
) {
  const cellSize = 32;
  const padding = 8;
  const solution = mode === "solution" ? getSolutionCells(grid) : new Set<string>();

  const numCols = grid.words.length > 12 ? 3 : grid.words.length > 6 ? 2 : 1;
  const wordsPerColumn = Math.ceil(grid.words.length / numCols);
  const wordListHeight = padding + wordsPerColumn * 14 + 20;

  const gridWidth = grid.size * cellSize + padding * 2;
  const minWordsWidth = numCols > 1 ? 100 * numCols + padding * 2 : gridWidth;
  const width = Math.max(gridWidth, minWordsWidth);
  const height = grid.size * cellSize + padding * 2 + wordListHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
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
      ctx.fillText(grid.grid[r]![c]!, x + cellSize / 2, y + cellSize / 2);
    }
  }

  const listY = padding + grid.size * cellSize + padding;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#333333";
  const colWidth = (width - padding * 2) / numCols;
  for (let i = 0; i < grid.words.length; i++) {
    const col = Math.floor(i / wordsPerColumn);
    const row = i - col * wordsPerColumn;
    ctx.fillText(grid.words[i]!.word, padding + col * colWidth, listY + row * 14);
  }

  const base = sanitizeFilename(title || "", "sopa-de-letras");
  const filename = mode === "solution" ? `${base}-solucion.png` : `${base}.png`;

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
