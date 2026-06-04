import type { HangmanResult } from "../puzzles/hangman/types";
import { sanitizeFilename } from "../../store/puzzle-store";

export async function generateHangmanPDF(
  result: HangmanResult,
  mode: "students" | "solution",
  title?: string,
  action: "preview" | "download" = "preview"
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;

  const displayTitle = title || "Adivina la Palabra";
  const pdfTitle = mode === "solution" ? `${displayTitle} - Solucion` : displayTitle;

  pdf.setFontSize(18);
  pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });

  let y = margin + 12;
  const lineHeight = 8;

  for (let i = 0; i < result.words.length; i++) {
    const word = result.words[i];

    if (y > 260) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text(`${i + 1}.`, margin, y);

    if (mode === "solution") {
      pdf.setFontSize(12);
      pdf.text(word.word, margin + 8, y);
    } else {
      const blanks = word.word
        .split("")
        .map(() => "_")
        .join("  ");
      pdf.setFontSize(12);
      pdf.text(blanks, margin + 8, y);
    }

    if (word.clue) {
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(`Pista: ${word.clue}`, margin + 8, y + lineHeight);
      y += lineHeight;
    }

    if (mode === "students") {
      pdf.setFontSize(8);
      pdf.setTextColor(160);
      pdf.text(
        `Intentos: ___  ___  ___  ___  ___  ___`,
        margin + 8,
        y + lineHeight
      );
      y += lineHeight;
    }

    y += lineHeight + 6;
  }

  const filename =
    mode === "solution"
      ? `${sanitizeFilename(title || "", "adivina-la-palabra")}-solucion.pdf`
      : `${sanitizeFilename(title || "", "adivina-la-palabra")}.pdf`;

  if (action === "download") {
    pdf.save(filename);
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
}
