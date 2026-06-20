import { useState } from "react";
import { toast } from "react-toastify";
import { usePuzzleStore } from "@/store/puzzle-store";
import { anagramGenerator } from "@/lib/puzzles/anagram/generator";
import Button from "@/components/ui/Button";
import ExampleButton from "@/components/ui/ExampleButton";

export default function AnagramInput() {
  const { setAnagramResult, setAnagramTitle, setLoading } = usePuzzleStore();

  const [wordsText, setWordsText] = useState("");
  const [title, setTitle] = useState("");

  const handleGenerate = () => {
    const lines = wordsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast.warning("Ingresa al menos una palabra");
      return;
    }

    const items = lines.map((line) => {
      const parts = line.split("-").map((p) => p.trim());
      const word = parts[0]!.toUpperCase().replace(/\s/g, "");
      const clue = parts.length > 1 ? parts.slice(1).join("-").trim() : "";
      return { word, clue };
    }).filter((item) => item.word.length >= 3);

    if (items.length === 0) {
      toast.warning("Ninguna palabra valida (minimo 3 letras)");
      return;
    }

    setAnagramTitle(title);
    setLoading(true);

    setTimeout(() => {
      try {
        const result = anagramGenerator.generate({ words: items });
        setAnagramResult(result.grid);
        toast.success("Anagramas generados!");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al generar");
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const handleLoadExample = () => {
    setWordsText(
      "ESCUELA - Lugar donde se estudia\nMAESTRO - Persona que enseña\nESTUDIANTE - Persona que aprende\nLIBRO - Objeto con paginas para leer\nLAPIZ - Utensillo para escribir"
    );
    setTitle("La Escuela");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Configuracion</h2>
        <ExampleButton onClick={handleLoadExample} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Palabras (una por linea). Formato: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">PALABRA - definicion</code>
        </label>
        <textarea
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          rows={6}
          className="input-field w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-y"
          placeholder={`ESCUELA - Lugar donde se estudia\nMAESTRO - Persona que enseña\nESTUDIANTE - Persona que aprende`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Titulo (opcional)
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
        <Button onClick={handleGenerate}>Generar</Button>
      </div>
    </div>
  );
}
