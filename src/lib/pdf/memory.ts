import type { MemoryResult } from "../puzzles/memory/types";
import { sanitizeFilename } from "../utils";

export async function generateMemoryPDF(
  result: MemoryResult,
  mode: "students" | "solution",
  title?: string,
  action: "preview" | "download" = "preview"
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;

  const displayTitle = title || "Memoria";
  const pdfTitle = mode === "solution" ? `${displayTitle} - Solucion` : displayTitle;

  pdf.setFontSize(18);
  pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });

  let y = margin + 12;

  if (mode === "solution") {
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text("Pares:", margin, y);
    y += 8;

    for (const pair of result.pairs) {
      if (y > 260) {
        pdf.addPage();
        y = margin;
      }
      pdf.setFontSize(10);
      pdf.setTextColor(60);
      pdf.text(`${pair.word} — ${pair.definition}`, margin + 4, y);
      y += 7;
    }
  } else {
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text("Tarjetas para recortar:", margin, y);
    y += 10;

    const colWidth = (pageWidth - margin * 2) / 2;

    for (let i = 0; i < result.pairs.length; i++) {
      const pair = result.pairs[i]!;

      if (y > 250) {
        pdf.addPage();
        y = margin;
      }

      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Palabra ${i + 1}:`, margin, y);
      y += 6;

      pdf.setFontSize(11);
      pdf.setTextColor(0);
      pdf.setDrawColor(180);
      pdf.roundedRect(margin, y, colWidth - 4, 10, 2, 2);
      pdf.text(pair.word, margin + 3, y + 7);
      y += 14;

      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Definicion ${i + 1}:`, margin, y);
      y += 6;

      pdf.setDrawColor(180);
      pdf.roundedRect(margin, y, colWidth - 4, 10, 2, 2);
      const defText = pair.definition.length > 40 ? pair.definition.slice(0, 37) + "..." : pair.definition;
      pdf.text(defText, margin + 3, y + 7);
      y += 16;
    }
  }

  const filename =
    mode === "solution"
      ? `${sanitizeFilename(title || "", "memoria")}-solucion.pdf`
      : `${sanitizeFilename(title || "", "memoria")}.pdf`;

  if (action === "download") {
    pdf.save(filename);
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
}
