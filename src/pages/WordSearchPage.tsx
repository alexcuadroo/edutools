import { Search } from "lucide-react";
import WordSearchInput from "../components/puzzles/WordSearch/WordSearchInput";
import WordSearchPreview from "../components/puzzles/WordSearch/WordSearchPreview";
import PuzzlePageLayout from "../components/layout/PuzzlePageLayout";

export default function WordSearchPage() {
  return (
    <PuzzlePageLayout
      title="Sopa de Letras"
      description="Ingresa las palabras y genera una sopa de letras lista para imprimir."
      icon={<Search className="w-5 h-5 text-indigo-600" />}
      input={<WordSearchInput />}
      preview={<WordSearchPreview />}
    />
  );
}
