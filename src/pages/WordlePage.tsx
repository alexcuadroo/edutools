import { Keyboard } from "lucide-react";
import PuzzlePageLayout from "@/components/layout/PuzzlePageLayout";
import WordleInput from "@/components/puzzles/Wordle/WordleInput";
import WordlePreview from "@/components/puzzles/Wordle/WordlePreview";

export default function WordlePage() { return <PuzzlePageLayout title="Cadenas de Palabras" description="Creá un Wordle educativo de 5 letras para jugar y compartir online." icon={<Keyboard className="h-5 w-5 text-indigo-600" />} input={<WordleInput />} preview={<WordlePreview />} />; }
