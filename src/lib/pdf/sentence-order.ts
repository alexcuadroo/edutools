import type { SentenceOrderResult } from "../puzzles/sentence-order/types";
import { sanitizeFilename } from "../../store/puzzle-store";

export async function generateSentenceOrderPDF(
  result: SentenceOrderResult,
  mode: "students" | "solution",
  title?: string,
  action: "preview" | "download" = "preview"
) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;

  const displayTitle = title || "Ordenar Oración";
  const pdfTitle = mode === "solution" ? `${displayTitle} - Solución` : displayTitle;

  pdf.setFontSize(18);
  pdf.text(pdfTitle, pageWidth / 2, margin, { align: "center" });

  let y = margin + 12;
  const lineHeight = 8;

  for (let i = 0; i < result.sentences.length; i++) {
    const sentence = result.sentences[i];

    if (y > 260) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text(`${i + 1}.`, margin, y);

    if (mode === "solution") {
      pdf.setFontSize(11);
      pdf.text(sentence.original, margin + 8, y);
    } else {
      const shuffled = sentence.shuffled.map((word, idx) => `${idx + 1}.${word}`).join("  ");
      pdf.setFontSize(10);
      pdf.text(shuffled, margin + 8, y);
      y += lineHeight;

      pdf.setFontSize(9);
      pdf.setTextColor(160);
      pdf.text(`Orden correcto: ___________________________________________________`, margin + 8, y);
    }

    y += lineHeight + 8;
  }

  const filename =
    mode === "solution"
      ? `${sanitizeFilename(title || "", "ordenar-oracion")}-solucion.pdf`
      : `${sanitizeFilename(title || "", "ordenar-oracion")}.pdf`;

  if (action === "download") {
    pdf.save(filename);
  } else {
    window.open(pdf.output("bloburl"), "_blank");
  }
}
