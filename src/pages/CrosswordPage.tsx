import { Grid3X3 } from "lucide-react";
import CrosswordInput from "@/components/puzzles/Crossword/CrosswordInput";
import CrosswordPreview from "@/components/puzzles/Crossword/CrosswordPreview";
import PuzzlePageLayout from "@/components/layout/PuzzlePageLayout";

export default function CrosswordPage() {
  return (
    <PuzzlePageLayout
      title="Crucigrama"
      description="Ingresa pares palabra:pista y genera un crucigrama listo para imprimir."
      icon={<Grid3X3 className="w-5 h-5 text-indigo-600" />}
      input={<CrosswordInput />}
      preview={<CrosswordPreview />}
    />
  );
}
