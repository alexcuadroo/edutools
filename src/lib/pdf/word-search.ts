import jsPDF from "jspdf";
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

function drawGrid(
  pdf: jsPDF,
  grid: string[][],
  x: number,
  y: number,
  cellSize: number,
  solution?: Set<string>
) {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const px = x + c * cellSize;
      const py = y + r * cellSize;
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.2);
      pdf.rect(px, py, cellSize, cellSize);
      if (solution?.has(`${r},${c}`)) {
        pdf.setFillColor(220, 240, 255);
        pdf.rect(px, py, cellSize, cellSize, "F");
      }
      const fontSize = cellSize * 0.72;
      pdf.setFontSize(fontSize);
      pdf.setTextColor(0);
      pdf.text(grid[r][c], px + cellSize / 2, py + cellSize / 2 + fontSize * 0.32, {
        align: "center",
      });
    }
  }
}

function drawWordList(
  pdf: jsPDF,
  grid: WSGrid,
  x: number,
  y: number,
  pageWidth: number
) {
  if (grid.words.length <= 12) {
    const cols = grid.words.length <= 6 ? 1 : grid.words.length <= 8 ? 2 : 3;
    pdf.setFontSize(10);
    for (let i = 0; i < grid.words.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const wx = x + col * ((pageWidth - x * 2) / cols);
      const wy = y + row * 8;
      pdf.text(grid.words[i].word, wx, wy);
    }
  } else {
    pdf.setFontSize(8);
    for (let i = 0; i < grid.words.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const wx = x + col * 55;
      const wy = y + row * 7;
      pdf.text(grid.words[i].word, wx, wy);
    }
  }
}

export function generateWordSearchPDF(
  grid: WSGrid,
  mode: "students" | "solution"
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const cellSize = Math.min(14, (pageWidth - margin * 2) / grid.size);
  const gridTotal = cellSize * grid.size;
  const gridX = (pageWidth - gridTotal) / 2;
  const gridY = margin + 10;
  const solution = mode === "solution" ? getSolutionCells(grid) : undefined;

  const title =
    mode === "solution"
      ? "Sopa de Letras - Solución"
      : "Sopa de Letras";

  pdf.setFontSize(18);
  pdf.text(title, pageWidth / 2, margin, { align: "center" });
  drawGrid(pdf, grid.grid, gridX, gridY, cellSize, solution);
  drawWordList(pdf, grid, margin, gridY + gridTotal + 10, pageWidth);

  const filename =
    mode === "solution" ? "sopa-de-letras-solucion.pdf" : "sopa-de-letras.pdf";

  pdf.save(filename);
}
