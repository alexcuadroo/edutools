import type { AnagramResult } from "../puzzles/anagram/types";
import { sanitizeFilename } from "../utils";

export async function generateAnagramPDF(
  result: AnagramResult,
  mode: "students" | "solution",
  title?: string,
  action: "preview" | "download" = "preview"
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;

  const displayTitle = title || "Anagrama";
  const pdfTitle = mode === "solution" ? `${displayTitle} - Solucion` : displayTitle;

  pdf.setFontSize(18);
  pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });

  let y = margin + 12;
  const lineHeight = 8;

  for (let i = 0; i < result.words.length; i++) {
    const word = result.words[i]!;

    if (y > 260) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text(`${i + 1}.`, margin, y);

    const scrambled = word.scrambled.split("").join("  ");
    pdf.setFontSize(14);
    pdf.text(scrambled, margin + 8, y);

    if (word.clue) {
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(`Pista: ${word.clue}`, margin + 8, y + lineHeight);
      y += lineHeight;
    }

    if (mode === "solution") {
      pdf.setFontSize(10);
      pdf.setTextColor(0);
      pdf.text(`Respuesta: ${word.word}`, margin + 8, y + lineHeight);
      y += lineHeight;
    } else {
      pdf.setFontSize(9);
      pdf.setTextColor(160);
      pdf.text(`Respuesta: ___________________________`, margin + 8, y + lineHeight);
      y += lineHeight;
    }

    y += lineHeight + 8;
  }

  const filename =
    mode === "solution"
      ? `${sanitizeFilename(title || "", "anagrama")}-solucion.pdf`
      : `${sanitizeFilename(title || "", "anagrama")}.pdf`;

  if (action === "download") {
    pdf.save(filename);
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
}
