import { useState } from "react";
import { toast } from "react-toastify";
import { usePuzzleStore } from "@/store/puzzle-store";
import { wordSearchGenerator } from "@/lib/puzzles/word-search/generator";
import type { WSGrid } from "@/lib/puzzles/word-search/types";
import Button from "@/components/ui/Button";
import ExampleButton from "@/components/ui/ExampleButton";

export default function WordSearchInput() {
  const { setWordSearchWords, setWordSearchResult, setWordSearchTitle, setLoading } =
    usePuzzleStore();

  const [wordsText, setWordsText] = useState("");
  const [gridSize, setGridSize] = useState(15);
  const [title, setTitle] = useState("");

  const handleGenerate = () => {
    const words = wordsText
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && w.length <= 20);

    if (words.length < 3) {
      toast.warning("Ingresa al menos 3 palabras");
      return;
    }

    const items = words.map((word) => ({ word, clue: "" }));

    setWordSearchWords(items);
    setWordSearchTitle(title);
    setLoading(true);

    setTimeout(() => {
      try {
        const result = wordSearchGenerator.generate({
          words: items,
          size: gridSize,
        });
        setWordSearchResult(result.grid as WSGrid);
        toast.success("¡Sopa de letras generada!");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al generar");
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const handleLoadExample = () => {
    setWordsText(
      "ESCUELA\nMAESTRO\nESTUDIANTE\nLIBRO\nLAPIZ\nTAREA\nCIENCIA\nHISTORIA"
    );
    setTitle("La Escuela");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
        <ExampleButton onClick={handleLoadExample} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Palabras (una por línea, 2-20 letras)
        </label>
        <textarea
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          rows={6}
          className="input-field w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-y"
          placeholder={`ESCUELA\nMAESTRO\nESTUDIANTE\n...`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Título (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: La Escuela"
          className="input-field w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tamaño del tablero
          </label>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="select-field border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none appearance-none bg-white"
          >
            <option value={10}>10×10 (fácil)</option>
            <option value={12}>12×12</option>
            <option value={15}>15×15</option>
            <option value={18}>18×18</option>
            <option value={20}>20×20 (difícil)</option>
          </select>
        </div>

        <Button onClick={handleGenerate}>
          Generar
        </Button>
      </div>
    </div>
  );
}
