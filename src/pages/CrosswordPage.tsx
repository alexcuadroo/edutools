import CrosswordInput from "../components/puzzles/Crossword/CrosswordInput";
import CrosswordPreview from "../components/puzzles/Crossword/CrosswordPreview";
import PuzzlePageLayout from "../components/layout/PuzzlePageLayout";

export default function CrosswordPage() {
  return (
    <PuzzlePageLayout
      title="Crucigrama"
      description="Ingresa pares palabra:pista y genera un crucigrama listo para imprimir."
      input={<CrosswordInput />}
      preview={<CrosswordPreview />}
    />
  );
}
