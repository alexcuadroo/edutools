import { Shuffle } from "lucide-react";
import AnagramInput from "@/components/puzzles/Anagram/AnagramInput";
import AnagramPreview from "@/components/puzzles/Anagram/AnagramPreview";
import PuzzlePageLayout from "@/components/layout/PuzzlePageLayout";

export default function AnagramPage() {
  return (
    <PuzzlePageLayout
      title="Anagrama"
      description="Genera anagramas personalizados. Ingresa palabras con definiciones y descarga el PDF."
      icon={<Shuffle className="w-5 h-5 text-indigo-600" />}
      input={<AnagramInput />}
      preview={<AnagramPreview />}
    />
  );
}
