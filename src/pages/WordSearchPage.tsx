import WordSearchInput from "../components/puzzles/WordSearch/WordSearchInput";
import WordSearchPreview from "../components/puzzles/WordSearch/WordSearchPreview";
import { usePuzzleStore } from "../store/puzzle-store";

export default function WordSearchPage() {
  const { loading, error } = usePuzzleStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sopa de Letras</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ingresa las palabras y genera una sopa de letras lista para imprimir.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <WordSearchInput />

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-gray-400 text-sm mt-2">Generando...</p>
        </div>
      )}

      <WordSearchPreview />
    </div>
  );
}
