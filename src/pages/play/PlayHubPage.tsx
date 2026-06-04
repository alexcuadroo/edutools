import { Link } from "react-router-dom";
import { Search, Grid3X3 } from "lucide-react";

const puzzles = [
  {
    path: "/jugar/sopa-de-letras",
    name: "Sopa de Letras",
    description: "Encuentra las palabras ocultas en la cuadrícula",
    icon: Search,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    path: "/jugar/crucigrama",
    name: "Crucigrama",
    description: "Resuelve el crucigrama con las pistas dadas",
    icon: Grid3X3,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
];

export default function PlayHubPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Puzzles para jugar</h1>
        <p className="text-gray-500">
          Selecciona un puzzle para comenzar a jugar
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {puzzles.map((puzzle) => {
          const Icon = puzzle.icon;
          return (
            <Link
              key={puzzle.path}
              to={puzzle.path}
              className={`block p-6 rounded-xl border-2 ${puzzle.color} hover:shadow-md transition-shadow`}
            >
              <Icon className="w-8 h-8 mb-3" />
              <h2 className="text-lg font-semibold mb-1">{puzzle.name}</h2>
              <p className="text-sm opacity-75">{puzzle.description}</p>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-400">
        Los puzzles se cargan desde un link compartido por tu docente
      </p>
    </div>
  );
}
