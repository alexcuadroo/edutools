import type { CWGrid } from "../puzzles/crossword/types";
import { sanitizeFilename } from "../utils";

function drawCrosswordGrid(
  pdf: InstanceType<typeof import("jspdf").default>,
  grid: CWGrid,
  x: number,
  y: number,
  cellSize: number
) {
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const px = x + c * cellSize;
      const py = y + r * cellSize;
      const isBlocked = grid.grid[r]?.[c] === null;

      if (isBlocked) {
        pdf.setFillColor(220, 220, 220);
        pdf.rect(px, py, cellSize, cellSize, "F");
      } else {
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.2);
        pdf.rect(px, py, cellSize, cellSize);

        pdf.setFontSize(cellSize * 0.55);
        pdf.setTextColor(0);
        pdf.text(grid.grid[r]![c]!, px + cellSize / 2, py + cellSize / 2 + cellSize * 0.18, {
          align: "center",
          baseline: "middle",
        });

        const num = grid.numbers.get(`${r},${c}`);
        if (num !== undefined) {
          pdf.setFontSize(cellSize * 0.55);
          pdf.text(String(num), px + 0.8, py + cellSize * 0.32);
        }
      }
    }
  }
}

export async function generateCrosswordPDF(
  grid: CWGrid,
  mode: "blank" | "solution",
  title?: string,
  action: "preview" | "download" = "preview"
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const cellSize = Math.min(10, (pageWidth - margin * 2) / grid.cols);
  const gridTotalX = cellSize * grid.cols;
  const gridTotalY = cellSize * grid.rows;
  const gridX = (pageWidth - gridTotalX) / 2;
  const gridY = margin + 8;

  const displayTitle = title || "Crucigrama";

  pdf.setFontSize(16);
  pdf.text(
    mode === "solution" ? `${displayTitle} - Solución` : displayTitle,
    pageWidth / 2,
    margin,
    { align: "center" }
  );

  const drawGrid = mode === "solution" ? grid : {
    ...grid,
    grid: grid.grid.map((row) =>
      row.map((cell) => (cell === null ? null : ""))
    ),
  };
  drawCrosswordGrid(pdf, drawGrid, gridX, gridY, cellSize);

  const across = grid.words.filter((w) => w.direction === "across");
  const down = grid.words.filter((w) => w.direction === "down");
  const wordsY = gridY + gridTotalY + 6;
  const availableHeight = pageHeight - margin - wordsY;
  const lineHeight = 5;
  const columnWidth = (pageWidth - margin * 2 - 5) / 2;

  const drawWordList = (
    words: typeof across,
    startX: number,
    startY: number,
    label: string,
    showClue: boolean
  ) => {
    pdf.setFontSize(10);
    pdf.text(label, startX, startY);
    
    const maxItemsPerColumn = Math.floor((availableHeight - 8) / lineHeight);
    const useTwoColumns = words.length > maxItemsPerColumn;
    
    for (let i = 0; i < words.length; i++) {
      const col = useTwoColumns && i >= Math.ceil(words.length / 2) ? 1 : 0;
      const row = useTwoColumns && col === 1 ? i - Math.ceil(words.length / 2) : i;
      const x = startX + col * (columnWidth / 2);
      const y = startY + 5 + row * lineHeight;
      
      pdf.setFontSize(8);
      const w = words[i]!;
      const text = showClue ? `${w.number}. ${w.clue}` : `${w.number}. ${w.word}`;
      pdf.text(text, x, y);
    }
  };

  if (across.length > 0) {
    drawWordList(across, margin, wordsY, "Horizontales", mode !== "solution");
  }
  if (down.length > 0) {
    drawWordList(down, margin + columnWidth + 5, wordsY, "Verticales", mode !== "solution");
  }

  const filename = `${sanitizeFilename(title || "", "crucigrama")}${mode === "solution" ? "-solucion" : ""}.pdf`;

  if (action === "download") {
    pdf.save(filename);
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
}
