import { TextCursorInput } from "lucide-react";
import FillBlanksInput from "../components/puzzles/FillBlanks/FillBlanksInput";
import FillBlanksPreview from "../components/puzzles/FillBlanks/FillBlanksPreview";
import PuzzlePageLayout from "../components/layout/PuzzlePageLayout";

export default function FillBlanksPage() {
  return (
    <PuzzlePageLayout
      title="Rellenar Huecos"
      description="Pega un texto y genera huecos aleatorios para completar. Incluye distractores automáticos."
      icon={<TextCursorInput className="w-5 h-5 text-indigo-600" />}
      input={<FillBlanksInput />}
      preview={<FillBlanksPreview />}
    />
  );
}
