import { Layers } from "lucide-react";
import MemoryInput from "@/components/puzzles/Memory/MemoryInput";
import MemoryPreview from "@/components/puzzles/Memory/MemoryPreview";
import PuzzlePageLayout from "@/components/layout/PuzzlePageLayout";

export default function MemoryPage() {
  return (
    <PuzzlePageLayout
      title="Memoria"
      description="Genera juegos de memoria con pares de palabras y definiciones. Juega online o descarga el PDF."
      icon={<Layers className="w-5 h-5 text-indigo-600" />}
      input={<MemoryInput />}
      preview={<MemoryPreview />}
    />
  );
}
