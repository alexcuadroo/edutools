import { useState } from "react";
import { toast } from "react-toastify";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { wordSearchGenerator } from "../../../lib/puzzles/word-search/generator";
import type { WSGrid } from "../../../lib/puzzles/word-search/types";

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
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
        <button
          onClick={handleLoadExample}
          className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 underline"
        >
          Cargar ejemplo
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Palabras (una por línea, 2-20 letras)
        </label>
        <textarea
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-y"
          placeholder="ESCUELA, MAESTRO, ESTUDIANTE, ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: La Escuela"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño del tablero
          </label>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
          >
            <option value={10}>10×10 (fácil)</option>
            <option value={12}>12×12</option>
            <option value={15}>15×15</option>
            <option value={18}>18×18</option>
            <option value={20}>20×20 (difícil)</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Generar
        </button>
      </div>
    </div>
  );
}
