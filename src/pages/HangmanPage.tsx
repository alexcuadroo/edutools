import { Heart } from "lucide-react";
import HangmanInput from "../components/puzzles/Hangman/HangmanInput";
import HangmanPreview from "../components/puzzles/Hangman/HangmanPreview";
import PuzzlePageLayout from "../components/layout/PuzzlePageLayout";

export default function HangmanPage() {
  return (
    <PuzzlePageLayout
      title="Adivina la Palabra"
      description="Genera juegos de adivinar palabras personalizadas. Ingresa palabras con definiciones y descarga el PDF."
      icon={<Heart className="w-5 h-5 text-indigo-600" />}
      input={<HangmanInput />}
      preview={<HangmanPreview />}
    />
  );
}
