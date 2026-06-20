import type { CWGrid } from "../puzzles/crossword/types";
import { sanitizeFilename } from "../utils";

export function downloadCrosswordPNG(
  grid: CWGrid,
  mode: "blank" | "solution",
  title?: string
) {
  const cellSize = 32;
  const padding = 8;

  const across = grid.words.filter((w) => w.direction === "across");
  const down = grid.words.filter((w) => w.direction === "down");

  const maxWordsInColumn = Math.max(across.length, down.length);
  const cluesHeight = maxWordsInColumn > 0 ? 16 + maxWordsInColumn * 12 + padding : 0;

  const gridWidth = grid.cols * cellSize + padding * 2;
  const cluesWidth = 320;
  const width = Math.max(gridWidth, cluesWidth);
  const height = grid.rows * cellSize + padding * 2 + cluesHeight;

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

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const x = padding + c * cellSize;
      const y = padding + r * cellSize;
      const letter = grid.grid[r]?.[c];

      if (letter === null) {
        ctx.fillStyle = "#e5e5e5";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillRect(x, y, cellSize, cellSize);

      ctx.strokeStyle = "#c0c0c0";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellSize, cellSize);

      if (letter && mode === "solution") {
        ctx.fillStyle = "#000000";
        ctx.fillText(letter, x + cellSize / 2, y + cellSize / 2);
      }

      const num = grid.numbers.get(`${r},${c}`);
      if (num !== undefined) {
        ctx.font = `${cellSize * 0.28}px monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#000000";
        ctx.fillText(String(num), x + 1, y + 1);
        ctx.font = `${cellSize * 0.68}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      }
    }
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const cy = padding + grid.rows * cellSize + padding;
  const columnWidth = (width - padding * 2) / 2;

  if (across.length > 0) {
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#333333";
    ctx.fillText("Horizontales", padding, cy);
    let itemY = cy + 14;
    ctx.font = "9px sans-serif";
    for (const w of across) {
      const text =
        mode === "solution" ? `${w.number}. ${w.word}` : `${w.number}. ${w.clue}`;
      ctx.fillText(text, padding, itemY);
      itemY += 12;
    }
  }

  if (down.length > 0) {
    const downX = padding + columnWidth;
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#333333";
    ctx.fillText("Verticales", downX, cy);
    let itemY = cy + 14;
    ctx.font = "9px sans-serif";
    for (const w of down) {
      const text =
        mode === "solution" ? `${w.number}. ${w.word}` : `${w.number}. ${w.clue}`;
      ctx.fillText(text, downX, itemY);
      itemY += 12;
    }
  }

  const base = sanitizeFilename(title || "", "crucigrama");
  const filename = mode === "solution" ? `${base}-solucion.png` : `${base}.png`;

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
