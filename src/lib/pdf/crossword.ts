import jsPDF from "jspdf";
import type { CWGrid } from "../puzzles/crossword/types";
import { sanitizeFilename } from "../../store/puzzle-store";

function drawCrosswordGrid(pdf: jsPDF, grid: CWGrid, x: number, y: number, cellSize: number) {
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const px = x + c * cellSize;
      const py = y + r * cellSize;
      const isBlocked = grid.grid[r][c] === null;

      if (isBlocked) {
        pdf.setFillColor(220, 220, 220);
        pdf.rect(px, py, cellSize, cellSize, "F");
      } else {
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.2);
        pdf.rect(px, py, cellSize, cellSize);

        pdf.setFontSize(cellSize * 0.55);
        pdf.setTextColor(0);
        pdf.text(grid.grid[r][c]!, px + cellSize / 2, py + cellSize / 2 + cellSize * 0.18, {
          align: "center",
          baseline: "middle",
        });

        const num = grid.numbers.get(`${r},${c}`);
        if (num !== undefined) {
          pdf.setFontSize(cellSize * 0.3);
          pdf.text(String(num), px + 1, py + cellSize * 0.3);
        }
      }
    }
  }
}

export function generateCrosswordPDF(
  grid: CWGrid,
  mode: "blank" | "solution",
  title?: string
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const cellSize = Math.min(14, (pageWidth - margin * 2) / grid.cols);
  const gridTotalX = cellSize * grid.cols;
  const gridTotalY = cellSize * grid.rows;
  const gridX = (pageWidth - gridTotalX) / 2;
  const gridY = margin + 10;

  const displayTitle = title || "Crucigrama";

  if (mode === "solution") {
    const pdfTitle = `${displayTitle} - Solución`;
    pdf.setFontSize(18);
    pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });
    drawCrosswordGrid(pdf, grid, gridX, gridY, cellSize);

    const across = grid.words.filter((w) => w.direction === "across");
    const down = grid.words.filter((w) => w.direction === "down");
    const wordsY = gridY + gridTotalY + 10;

    if (across.length > 0) {
      pdf.setFontSize(11);
      pdf.text("Horizontales", margin, wordsY);
      for (let i = 0; i < across.length; i++) {
        pdf.setFontSize(9);
        pdf.text(`${across[i].number}. ${across[i].word}`, margin, wordsY + 7 + i * 6);
      }
    }
    if (down.length > 0) {
      const ds = wordsY + 7 + across.length * 6 + 4;
      pdf.setFontSize(11);
      pdf.text("Verticales", margin, ds);
      for (let i = 0; i < down.length; i++) {
        pdf.setFontSize(9);
        pdf.text(`${down[i].number}. ${down[i].word}`, margin, ds + 7 + i * 6);
      }
    }

    pdf.save(
      `${sanitizeFilename(title || "", "crucigrama")}-solucion.pdf`
    );
    return;
  }

  pdf.setFontSize(18);
  pdf.text(displayTitle, pageWidth / 2, margin, { align: "center" });

  const blankGrid: CWGrid = {
    ...grid,
    grid: grid.grid.map((row) =>
      row.map((cell) => (cell === null ? null : ""))
    ),
  };
  drawCrosswordGrid(pdf, blankGrid, gridX, gridY, cellSize);

  const across = grid.words.filter((w) => w.direction === "across");
  const down = grid.words.filter((w) => w.direction === "down");
  const cluesY = gridY + gridTotalY + 8;

  if (across.length > 0) {
    pdf.setFontSize(11);
    pdf.text("Horizontales", margin, cluesY);
    for (let i = 0; i < across.length; i++) {
      pdf.setFontSize(9);
      pdf.text(`${across[i].number}. ${across[i].clue}`, margin, cluesY + 7 + i * 6);
    }
  }
  if (down.length > 0) {
    const ds = cluesY + 7 + across.length * 6 + 4;
    pdf.setFontSize(11);
    pdf.text("Verticales", margin, ds);
    for (let i = 0; i < down.length; i++) {
      pdf.setFontSize(9);
      pdf.text(`${down[i].number}. ${down[i].clue}`, margin, ds + 7 + i * 6);
    }
  }

  pdf.save(`${sanitizeFilename(title || "", "crucigrama")}.pdf`);
}
