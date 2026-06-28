import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import AnagramGame from "@/components/playable/AnagramGame";
import { loadPuzzle } from "@/lib/share/api";
import { PUZZLE_TYPE_TO_SLUG } from "@/lib/puzzles/slugs";
import type { PlayablePuzzleType } from "@/lib/share/types";

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
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedCode = code.trim().toLowerCase();
    if (!normalizedCode) {
      setError("Ingresá un código de puzzle");
      return;
    }

    if (normalizedCode.length !== 8) {
      setError("El código debe tener exactamente 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const data = await loadPuzzle(normalizedCode);
      const type = data.type as PlayablePuzzleType;
      const route = PUZZLE_TYPE_TO_SLUG[type];
      if (!route) {
        setError("Tipo de puzzle no reconocido");
        return;
      }
      navigate(`/jugar/${route}/${normalizedCode}`);
    } catch {
      setError("Puzzle no encontrado. Verificá el código e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-2">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Jugar un puzzle</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Ingresá el código que te compartió el docente para acceder al puzzle.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="puzzle-code" className="block text-sm font-medium text-gray-700 mb-2">
                Código del puzzle
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="puzzle-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej: f3d78213"
                  maxLength={8}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors text-lg font-mono uppercase"
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={loading || code.trim().length !== 8}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2 sm:w-auto w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    "Jugar"
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs sm:text-sm text-gray-400">
            ¿No tenés un código? Probá este ejemplo:
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
      </div>
    </div>
  );
}
