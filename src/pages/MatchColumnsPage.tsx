import { Link } from "lucide-react";
import MatchColumnsInput from "@/components/puzzles/MatchColumns/MatchColumnsInput";
import MatchColumnsPreview from "@/components/puzzles/MatchColumns/MatchColumnsPreview";
import PuzzlePageLayout from "@/components/layout/PuzzlePageLayout";

export default function MatchColumnsPage() {
  return (
    <PuzzlePageLayout
      title="Relacionar Columnas"
      description="Genera juegos de relacionar palabras con sus definiciones. Ingresa los pares y descarga el PDF."
      icon={<Link className="w-5 h-5 text-indigo-600" />}
      input={<MatchColumnsInput />}
      preview={<MatchColumnsPreview />}
    />
  );
}
