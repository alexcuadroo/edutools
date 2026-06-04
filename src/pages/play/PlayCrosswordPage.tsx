import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import CrosswordGame from "../../components/playable/CrosswordGame";
import { loadPuzzle } from "../../lib/share/api";
import {
  type CWPlayData,
  playDataToCWWords,
  playDataToCWNumbers,
} from "../../lib/share/types";
import { useAttemptCounter } from "../../hooks/useAttemptCounter";

interface DecodedData {
  grid: (string | null)[][];
  rows: number;
  cols: number;
  words: { word: string; clue: string; number: number; direction: "across" | "down"; startRow: number; startCol: number }[];
  numbers: Map<string, number>;
  title?: string;
}

export default function PlayCrosswordPage() {
  const { id } = useParams<{ id: string }>();
  const [decoded, setDecoded] = useState<DecodedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    loadPuzzle(id)
      .then((payload) => {
        const data = payload.puzzle as CWPlayData;
        setDecoded({
          grid: data.g,
          rows: data.r,
          cols: data.c,
          words: playDataToCWWords(data),
          numbers: playDataToCWNumbers(data),
          title: data.t,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const { count: attemptCount, increment: onAttemptIncrement } = useAttemptCounter("crucigrama", id || "");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
        <p className="text-gray-500">Cargando puzzle...</p>
      </div>
    );
  }

  if (error || !decoded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h1 className="text-xl font-bold text-gray-900">Puzzle no encontrado</h1>
        <p className="text-gray-500 max-w-sm">
          El link del puzzle no es válido o ha expirado. Pídele al anfitrión que
          genere un nuevo link.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
      <CrosswordGame
        grid={decoded.grid}
        rows={decoded.rows}
        cols={decoded.cols}
        words={decoded.words}
        numbers={decoded.numbers}
        title={decoded.title}
        attemptCount={attemptCount}
        onAttemptIncrement={onAttemptIncrement}
      />
    </div>
  );
}
