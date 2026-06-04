import { useState } from "react";
import { toast } from "react-toastify";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { sentenceOrderGenerator } from "../../../lib/puzzles/sentence-order/generator";
import Button from "../../ui/Button";
import ExampleButton from "../../ui/ExampleButton";

export default function SentenceOrderInput() {
  const { setSentenceOrderResult, setSentenceOrderTitle, setLoading } = usePuzzleStore();

  const [sentencesText, setSentencesText] = useState("");
  const [title, setTitle] = useState("");

  const handleGenerate = () => {
    const lines = sentencesText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast.warning("Ingresa al menos una oración");
      return;
    }

    const items = lines.map((sentence) => ({ word: sentence, clue: "" }));

    setSentenceOrderTitle(title);
    setLoading(true);

    setTimeout(() => {
      try {
        const result = sentenceOrderGenerator.generate({ words: items });
        setSentenceOrderResult(result.grid);
        toast.success("Oraciones generadas!");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al generar");
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const handleLoadExample = () => {
    setSentencesText(
      "El perro corre en el parque\nLa maestra enseña a los estudiantes\nLos ninos juegan en el recreo\nEl sol brilla en el cielo azul\nLos libros estan en la biblioteca"
    );
    setTitle("Oraciones Cotidianas");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Configuracion</h2>
        <ExampleButton onClick={handleLoadExample} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Oraciones (una por línea, mínimo 3 palabras)
        </label>
        <textarea
          value={sentencesText}
          onChange={(e) => setSentencesText(e.target.value)}
          rows={6}
          className="input-field w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-y"
          placeholder={`El perro corre en el parque\nLa maestra enseña a los estudiantes\nLos ninos juegan en el recreo`}
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
          placeholder="Ej: Oraciones Cotidianas"
          className="input-field w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <Button onClick={handleGenerate}>Generar</Button>
      </div>
    </div>
  );
}
