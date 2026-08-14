import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import ExampleButton from "@/components/ui/ExampleButton";
import { roscoGenerator } from "@/lib/puzzles/rosco/generator";
import { ROSCO_LETTERS, type RoscoEntry, type RoscoRule } from "@/lib/puzzles/rosco/types";
import { usePuzzleStore } from "@/store/puzzle-store";

const EXAMPLE_ANSWERS: Record<string, [string, string, RoscoRule]> = {
  A: ["ÁRBOL", "Planta de tronco leñoso.", "starts-with"], B: ["BIBLIOTECA", "Lugar donde se guardan libros.", "starts-with"], C: ["CÉLULA", "Unidad básica de los seres vivos.", "starts-with"], D: ["DEMOCRACIA", "Forma de gobierno elegida por la ciudadanía.", "starts-with"], E: ["ECOSISTEMA", "Conjunto de seres vivos y su ambiente.", "starts-with"], F: ["FOTOSÍNTESIS", "Proceso con el que las plantas producen alimento.", "starts-with"], G: ["GEOMETRÍA", "Rama de las matemáticas que estudia las formas.", "starts-with"], H: ["HISTORIA", "Estudio de los hechos del pasado.", "starts-with"], I: ["IMÁN", "Objeto que atrae ciertos metales.", "starts-with"], J: ["JÚPITER", "Planeta más grande del sistema solar.", "starts-with"], K: ["KILÓMETRO", "Unidad de longitud equivalente a mil metros.", "starts-with"], L: ["LITERATURA", "Arte de expresarse mediante las palabras.", "starts-with"], M: ["MATERIA", "Todo lo que tiene masa y ocupa espacio.", "starts-with"], N: ["NÚCLEO", "Parte central de una célula o átomo.", "starts-with"], O: ["OCÉANO", "Gran extensión de agua salada.", "starts-with"], P: ["PLANETA", "Cuerpo celeste que gira alrededor de una estrella.", "starts-with"], Q: ["QUÍMICA", "Ciencia que estudia la materia y sus cambios.", "starts-with"], R: ["RECICLAJE", "Proceso de transformar residuos para reutilizarlos.", "starts-with"], S: ["SISTEMA SOLAR", "Conjunto formado por el Sol y los cuerpos que lo orbitan.", "starts-with"], T: ["TEOREMA", "Proposición matemática demostrable.", "starts-with"], U: ["UNIVERSO", "Totalidad del espacio, tiempo y materia.", "starts-with"], V: ["VOLCÁN", "Abertura terrestre que expulsa lava.", "starts-with"], W: ["WATT", "Unidad de potencia eléctrica.", "starts-with"], X: ["TEXTO", "Conjunto ordenado de enunciados; contiene la X.", "contains"], Y: ["YACIMIENTO", "Lugar donde se encuentra un recurso natural.", "starts-with"], Z: ["ZOOLOGÍA", "Ciencia que estudia los animales.", "starts-with"],
};

function emptyEntries(): RoscoEntry[] {
  return ROSCO_LETTERS.map((letter) => ({ letter, answer: "", clue: "", rule: "starts-with" }));
}

export default function RoscoInput() {
  const { setRoscoResult, setRoscoTitle, setLoading } = usePuzzleStore();
  const [entries, setEntries] = useState<RoscoEntry[]>(emptyEntries);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("3");
  const [seconds, setSeconds] = useState("0");

  const updateEntry = (index: number, field: keyof Omit<RoscoEntry, "letter">, value: string) => {
    setEntries((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry));
  };

  const handleGenerate = () => {
    const minuteValue = Number(minutes);
    const secondValue = Number(seconds);
    if (!Number.isInteger(minuteValue) || minuteValue < 0 || minuteValue > 60 || !Number.isInteger(secondValue) || secondValue < 0 || secondValue > 59) {
      toast.warning("Ingresá entre 0 y 60 minutos y entre 0 y 59 segundos.");
      return;
    }
    const durationSeconds = minuteValue * 60 + secondValue;
    setLoading(true);
    try {
      const result = roscoGenerator.generate({ words: [], entries, durationSeconds });
      setRoscoTitle(title.trim());
      setRoscoResult(result.grid);
      toast.success("Rosco generado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar el rosco");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = () => {
    setEntries(ROSCO_LETTERS.map((letter) => {
      const [answer, clue, rule] = EXAMPLE_ANSWERS[letter]!;
      return { letter, answer, clue, rule };
    }));
    setTitle("Rosco de conocimientos generales");
    setMinutes("3");
    setSeconds("0");
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6" aria-labelledby="rosco-config-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="rosco-config-title" className="text-lg font-semibold text-gray-900">Configuración del rosco</h2>
          <p className="text-sm text-gray-500 mt-1">Completá una pregunta por cada letra, de la A a la Z.</p>
        </div>
        <ExampleButton onClick={handleExample} />
      </div>

      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
        <label className="block text-sm font-medium text-gray-700">Título (opcional)
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Ciencias naturales" className="input-field mt-1.5 w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none" />
        </label>
        <label className="block text-sm font-medium text-gray-700">Minutos
          <input type="number" min="0" max="60" value={minutes} onChange={(event) => setMinutes(event.target.value)} className="input-field mt-1.5 w-24 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none" />
        </label>
        <label className="block text-sm font-medium text-gray-700">Segundos
          <input type="number" min="0" max="59" value={seconds} onChange={(event) => setSeconds(event.target.value)} className="input-field mt-1.5 w-24 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none" />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Entradas del rosco por letra</caption>
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide"><tr><th scope="col" className="p-3">Letra</th><th scope="col" className="p-3">Respuesta</th><th scope="col" className="p-3">Regla</th><th scope="col" className="p-3">Pista</th></tr></thead>
          <tbody>{entries.map((entry, index) => <tr key={entry.letter} className="border-t border-gray-100">
            <th scope="row" className="p-3 font-bold text-indigo-700">{entry.letter}</th>
            <td className="p-2"><label className="sr-only" htmlFor={`rosco-answer-${entry.letter}`}>Respuesta para la letra {entry.letter}</label><input id={`rosco-answer-${entry.letter}`} value={entry.answer} onChange={(event) => updateEntry(index, "answer", event.target.value)} className="input-field w-full border border-gray-300 rounded-md px-3 py-2 outline-none" /></td>
            <td className="p-2"><label className="sr-only" htmlFor={`rosco-rule-${entry.letter}`}>Regla para la letra {entry.letter}</label><select id={`rosco-rule-${entry.letter}`} value={entry.rule} onChange={(event) => updateEntry(index, "rule", event.target.value)} className="input-field w-full border border-gray-300 rounded-md px-3 py-2 outline-none"><option value="starts-with">Empieza con</option><option value="contains">Contiene</option></select></td>
            <td className="p-2"><label className="sr-only" htmlFor={`rosco-clue-${entry.letter}`}>Pista para la letra {entry.letter}</label><input id={`rosco-clue-${entry.letter}`} value={entry.clue} onChange={(event) => updateEntry(index, "clue", event.target.value)} className="input-field w-full border border-gray-300 rounded-md px-3 py-2 outline-none" /></td>
          </tr>)}</tbody>
        </table>
      </div>
      <Button onClick={handleGenerate}>Generar rosco</Button>
    </section>
  );
}
