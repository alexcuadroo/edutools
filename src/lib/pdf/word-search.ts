import type { WSGrid } from "../puzzles/word-search/types";
import { getSolutionCells } from "../puzzles/word-search/solution-cells";
import { sanitizeFilename } from "../utils";

function drawGrid(
  pdf: InstanceType<typeof import("jspdf").default>,
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
      const cellLetter = grid[r]![c]!;
      pdf.text(cellLetter, px + cellSize / 2, py + cellSize / 2 + fontSize * 0.32, {
        align: "center",
      });
    }
  }
}

function drawWordList(
  pdf: InstanceType<typeof import("jspdf").default>,
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
      pdf.text(grid.words[i]!.word, wx, wy);
    }
  } else {
    pdf.setFontSize(8);
    for (let i = 0; i < grid.words.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const wx = x + col * 55;
      const wy = y + row * 7;
      pdf.text(grid.words[i]!.word, wx, wy);
    }
  }
}

export async function generateWordSearchPDF(
  grid: WSGrid,
  mode: "students" | "solution",
  title?: string,
  action: "preview" | "download" = "preview"
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const cellSize = Math.min(14, (pageWidth - margin * 2) / grid.size);
  const gridTotal = cellSize * grid.size;
  const gridX = (pageWidth - gridTotal) / 2;
  const gridY = margin + 10;
  const solution = mode === "solution" ? getSolutionCells(grid) : undefined;

  const displayTitle = title || "Sopa de Letras";
  const pdfTitle =
    mode === "solution" ? `${displayTitle} - Solución` : displayTitle;

  pdf.setFontSize(18);
  pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });
  drawGrid(pdf, grid.grid, gridX, gridY, cellSize, solution);
  drawWordList(pdf, grid, margin, gridY + gridTotal + 10, pageWidth);

  const filename =
    mode === "solution"
      ? `${sanitizeFilename(title || "", "sopa-de-letras")}-solucion.pdf`
      : `${sanitizeFilename(title || "", "sopa-de-letras")}.pdf`;

  if (action === "download") {
    pdf.save(filename);
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
}
