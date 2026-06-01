import { useState } from "react";
import { toast } from "react-toastify";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { fillBlanksGenerator } from "../../../lib/puzzles/fill-blanks/generator";

const EXAMPLE_TEXT = `México es un país ubicado en América del Norte. Su capital es la Ciudad de México, una de las ciudades más grandes del mundo. El país tiene una rica historia que incluye civilizaciones antiguas como los aztecas y los mayas. La gastronomía mexicana es famosa mundialmente por sus sabores intensos y variados. Algunos platillos típicos son los tacos, el mole y las enchiladas.`;

export default function FillBlanksInput() {
  const { setFillBlanksResult, setFillBlanksTitle, setLoading } = usePuzzleStore();

  const [text, setText] = useState("");
  const [blankCount, setBlankCount] = useState(5);
  const [title, setTitle] = useState("");

  const handleGenerate = () => {
    if (text.trim().length < 20) {
      toast.warning("El texto debe tener al menos 20 caracteres");
      return;
    }

    setFillBlanksTitle(title);
    setLoading(true);

    setTimeout(() => {
      try {
        const result = fillBlanksGenerator.generateFromText({
          text: text.trim(),
          blankCount,
        });
        setFillBlanksResult(result);
        toast.success("¡Texto con huecos generado!");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al generar");
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const handleLoadExample = () => {
    setText(EXAMPLE_TEXT);
    setTitle("México");
    setBlankCount(5);
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
          Texto base
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-y"
          placeholder="Pega aquí el texto al que quieres agregar huecos..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {text.length} caracteres
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
          placeholder="Ej: México"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de huecos
          </label>
          <select
            value={blankCount}
            onChange={(e) => setBlankCount(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
          >
            <option value={3}>3 huecos</option>
            <option value={4}>4 huecos</option>
            <option value={5}>5 huecos</option>
            <option value={6}>6 huecos</option>
            <option value={7}>7 huecos</option>
            <option value={8}>8 huecos</option>
            <option value={10}>10 huecos</option>
            <option value={12}>12 huecos</option>
            <option value={15}>15 huecos</option>
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
