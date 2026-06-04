import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnagramGame from "../../components/playable/AnagramGame";

const DEMO_ANAGRAM = {
  words: [
    {
      word: "ESCUELA",
      clue: "Lugar donde se enseña y se aprende",
      scrambled: "LACUESE",
    },
  ],
  title: "Ejemplo de Anagrama",
};

export default function PlayHubPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-sm sm:text-base">
            Los puzzles se cargan desde un link compartido por el anfitrión.
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            Mientras tanto, probá este ejemplo:
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              DEMO
            </span>
            <span className="text-xs sm:text-sm text-gray-600">
              Ejemplo interactivo de anagrama
            </span>
          </div>
          <AnagramGame
            words={DEMO_ANAGRAM.words}
            title={DEMO_ANAGRAM.title}
          />
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors no-underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
