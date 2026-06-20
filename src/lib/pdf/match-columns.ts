import type { MCResult } from "@/lib/puzzles/match-columns/types";
import { sanitizeFilename } from "@/lib/utils";

export async function generateMatchColumnsPDF(
  result: MCResult,
  mode: "students" | "solution",
  title?: string,
  action: "preview" | "download" = "preview"
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;

  const displayTitle = title || "Relacionar Columnas";
  const pdfTitle = mode === "solution" ? `${displayTitle} - Solucion` : displayTitle;

  pdf.setFontSize(18);
  pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });

  let y = margin + 12;
  const lineHeight = 8;
  const colWidth = (pageWidth - margin * 2 - 10) / 2;

  if (mode === "students") {
    pdf.setFontSize(12);
    pdf.setFont(undefined!, "bold");
    pdf.text("Palabras", margin, y);
    pdf.text("Definiciones", margin + colWidth + 10, y);
    y += lineHeight + 4;

    for (let i = 0; i < result.matches.length; i++) {
      if (y > 260) {
        pdf.addPage();
        y = margin;
      }

      pdf.setFontSize(10);
      pdf.setFont(undefined!, "normal");
      pdf.text(`${i + 1}. ${result.matches[i]!.word}`, margin, y);
      pdf.text(`${i + 1}. ${result.shuffledDefinitions[i] ?? ""}`, margin + colWidth + 10, y);
      y += lineHeight + 2;
    }
  } else {
    pdf.setFontSize(12);
    pdf.setFont(undefined!, "bold");
    pdf.text("Soluciones", margin, y);
    y += lineHeight + 4;

    for (let i = 0; i < result.matches.length; i++) {
      if (y > 260) {
        pdf.addPage();
        y = margin;
      }

      const match = result.matches[i]!;
      pdf.setFontSize(10);
      pdf.setFont(undefined!, "normal");
      pdf.text(`${i + 1}. ${match.word} → ${match.definition}`, margin, y);
      y += lineHeight + 2;
    }
  }

  const filename =
    mode === "solution"
      ? `${sanitizeFilename(title || "", "relacionar-columnas")}-solucion.pdf`
      : `${sanitizeFilename(title || "", "relacionar-columnas")}.pdf`;

  if (action === "download") {
    pdf.save(filename);
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
}
