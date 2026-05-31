import { Link } from "react-router-dom";

const PUZZLES = [
  {
    path: "/sopa-de-letras",
    title: "Sopa de Letras",
    description:
      "Genera sopas de letras personalizadas. Ingresa palabras, elige el modo de presentación y descarga el PDF listo para usar en clase.",
    emoji: "🔤",
  },
  {
    path: "/crucigrama",
    title: "Crucigrama",
    description:
      "Crea crucigramas con pistas. Ideal para evaluaciones o actividades de refuerzo. Descarga el PDF con o sin solucionario.",
    emoji: "📝",
  },
];

export default function HomePage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Generador de Puzzles Educativos
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Crea sopas de letras y crucigramas en segundos. Sin registro, sin
          límites. Descarga tus puzzles en PDF.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {PUZZLES.map((puzzle) => (
          <Link
            key={puzzle.path}
            to={puzzle.path}
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all no-underline"
          >
            <div className="text-3xl mb-3">{puzzle.emoji}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {puzzle.title}
            </h2>
            <p className="text-sm text-gray-500">{puzzle.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
