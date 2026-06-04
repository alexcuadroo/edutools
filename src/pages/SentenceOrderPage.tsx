import { ListOrdered } from "lucide-react";
import SentenceOrderInput from "../components/puzzles/SentenceOrder/SentenceOrderInput";
import SentenceOrderPreview from "../components/puzzles/SentenceOrder/SentenceOrderPreview";
import PuzzlePageLayout from "../components/layout/PuzzlePageLayout";

export default function SentenceOrderPage() {
  return (
    <PuzzlePageLayout
      title="Ordenar Oración"
      description="Genera oraciones desordenadas para que los estudiantes las ordenen correctamente."
      icon={<ListOrdered className="w-5 h-5 text-indigo-600" />}
      input={<SentenceOrderInput />}
      preview={<SentenceOrderPreview />}
    />
  );
}
