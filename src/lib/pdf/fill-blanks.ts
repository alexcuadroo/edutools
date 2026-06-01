import type { FillBlanksResult } from "../puzzles/fill-blanks/types";
import { sanitizeFilename } from "../../store/puzzle-store";

function drawText(
  pdf: InstanceType<typeof import("jspdf").default>,
  result: FillBlanksResult,
  x: number,
  y: number,
  maxWidth: number,
  showSolution: boolean,
): number {
  const lineHeight = 8;
  const fontSize = 12;
  const blankWidth = 25;
  const blankIndices = new Set(result.blanks.map((b) => b.tokenIndex));

  pdf.setFontSize(fontSize);
  let currentX = x;
  let currentY = y;

  for (const token of result.tokens) {
    if (token.type === "space") {
      const spaceWidth = pdf.getTextWidth(" ");
      if (currentX + spaceWidth > x + maxWidth) {
        currentX = x;
        currentY += lineHeight;
      }
      currentX += spaceWidth;
      continue;
    }

    if (token.type === "punctuation") {
      const punctWidth = pdf.getTextWidth(token.value);
      if (currentX + punctWidth > x + maxWidth) {
        currentX = x;
        currentY += lineHeight;
      }
      pdf.setTextColor(0);
      pdf.text(token.value, currentX, currentY);
      currentX += punctWidth;
      continue;
    }

    const isBlank = blankIndices.has(token.index);
    const wordWidth = pdf.getTextWidth(token.value);

    if (isBlank) {
      const displayWidth = Math.max(blankWidth, wordWidth + 4);
      if (currentX + displayWidth > x + maxWidth) {
        currentX = x;
        currentY += lineHeight;
      }

      if (showSolution) {
        pdf.setTextColor(0, 100, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text(token.value, currentX, currentY);
        pdf.setDrawColor(0, 100, 0);
        pdf.setLineWidth(0.5);
        pdf.line(currentX, currentY + 1, currentX + wordWidth, currentY + 1);
        pdf.setFont("helvetica", "normal");
      } else {
        pdf.setDrawColor(100);
        pdf.setLineWidth(0.3);
        pdf.line(currentX, currentY + 1, currentX + displayWidth, currentY + 1);
      }
      currentX += displayWidth + 2;
    } else {
      if (currentX + wordWidth > x + maxWidth) {
        currentX = x;
        currentY += lineHeight;
      }
      pdf.setTextColor(0);
      pdf.text(token.value, currentX, currentY);
      currentX += wordWidth;
    }
  }

  return currentY + lineHeight;
}

function drawOptions(
  pdf: InstanceType<typeof import("jspdf").default>,
  options: string[],
  x: number,
  y: number,
): number {
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text("Respuestas", x, y);
  pdf.setFont("helvetica", "normal");

  pdf.setFontSize(11);
  pdf.setTextColor(0);
  const optionsText = options.join(" - ");
  const lines = pdf.splitTextToSize(optionsText, 170);
  pdf.text(lines, x, y + 8);

  return y + 8 + lines.length * 6;
}

export async function generateFillBlanksPDF(
  result: FillBlanksResult,
  mode: "students" | "solution",
  title?: string,
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;
  const maxWidth = pageWidth - margin * 2;

  const displayTitle = title || "Rellenar Huecos";
  const pdfTitle =
    mode === "solution" ? `${displayTitle} - Solución` : displayTitle;

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });
  pdf.setFont("helvetica", "normal");

  let currentY = margin + 12;

  pdf.setFontSize(10);
  pdf.setTextColor(80);
  if (mode === "students") {
    pdf.text(
      "Lee el texto y completa cada palabra que falta. Elige una palabra de la lista de respuestas.",
      margin,
      currentY,
    );
  } else {
    pdf.text(
      "Solucionario: las palabras correctas están resaltadas en verde.",
      margin,
      currentY,
    );
  }
  currentY += 10;

  pdf.setTextColor(0);
  currentY = drawText(
    pdf,
    result,
    margin,
    currentY,
    maxWidth,
    mode === "solution",
  );

  if (mode === "students") {
    currentY += 8;
    drawOptions(pdf, result.options, margin, currentY);
  }

  const filename =
    mode === "solution"
      ? `${sanitizeFilename(title || "", "rellenar-huecos")}-solucion.pdf`
      : `${sanitizeFilename(title || "", "rellenar-huecos")}.pdf`;

  pdf.save(filename);
}
