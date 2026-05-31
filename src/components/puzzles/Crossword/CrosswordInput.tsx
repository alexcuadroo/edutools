import { useState } from "react";
import { toast } from "react-toastify";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { crosswordGenerator } from "../../../lib/puzzles/crossword/generator";
import type { CWGrid } from "../../../lib/puzzles/crossword/types";

export default function CrosswordInput() {
  const {
    setCrosswordWords,
    setCrosswordResult,
    setCrosswordTitle,
    setLoading,
  } = usePuzzleStore();

  const [wordsText, setWordsText] = useState("");
  const [title, setTitle] = useState("");

  const handleGenerate = () => {
    const lines = wordsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const items: { word: string; clue: string }[] = [];

    for (const line of lines) {
      const parts = line.split(/[:\-–—]\s*/);
      if (parts.length >= 2) {
        const word = parts[0].trim().toUpperCase();
        const clue = parts.slice(1).join(": ").trim();
        if (word.length >= 2 && word.length <= 20 && clue.length > 0) {
          items.push({ word, clue });
        }
      }
    }

    if (items.length < 3) {
      toast.warning(
        "Ingresa al menos 3 palabras con pistas (formato: PALABRA: pista)"
      );
      return;
    }
    if (items.length > 15) {
      toast.warning("Máximo 15 palabras para crucigrama liviano");
      return;
    }

    setCrosswordWords(items);
    setCrosswordTitle(title);
    setLoading(true);

    setTimeout(() => {
      try {
        const result = crosswordGenerator.generate({
          words: items,
        });
        setCrosswordResult(result.grid as CWGrid);
        toast.success("¡Crucigrama generado!");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al generar");
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const handleLoadExample = () => {
    setWordsText(
      "SOL: Estrella del sistema solar\n" +
        "LUNA: Satelite natural de la Tierra\n" +
        "TIERRA: Tercer planeta del sistema solar\n" +
        "MARTE: Planeta rojo\n" +
        "VENUS: Segundo planeta\n" +
        "JUPITER: Planeta mas grande\n" +
        "SATURNO: Planeta con anillos"
    );
    setTitle("El Sistema Solar");
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
          Palabras y pistas (una por línea, formato: PALABRA: pista)
        </label>
        <textarea
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          rows={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-y font-mono"
          placeholder="SOL: Estrella del sistema solar, LUNA: Satelite natural, ..."
        />
        <p className="text-xs text-gray-400 mt-1">
          Mínimo 3, máximo 15 palabras (modo liviano). Palabras de 2 a 20 letras.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: El Sistema Solar"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
        />
      </div>

      <button
        onClick={handleGenerate}
        className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Generar
      </button>
    </div>
  );
}
