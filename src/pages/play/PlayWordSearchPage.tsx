import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import WordSearchGame from "@/components/playable/WordSearchGame";
import { type WSPlayData, playDataToWSWords } from "@/lib/share/types";
import { usePuzzleLoader } from "@/hooks/usePuzzleLoader";
import { useAttemptCounter } from "@/hooks/useAttemptCounter";
import { useLiveProgress } from "@/hooks/useLiveProgress";
import { StudentIdentityModal } from "@/components/playable/StudentIdentityModal";
import type { ProgressSnapshot } from "@/lib/progress/types";

export default function PlayWordSearchPage() {
  const { id } = useParams<{ id: string }>();
  const { data: decoded, loading, error } = usePuzzleLoader(id, (puzzle) => {
    const d = puzzle as WSPlayData;
    return {
      grid: d.g,
      size: d.s,
      words: playDataToWSWords(d),
      title: d.t,
    };
  });

  const { count: attemptCount, increment: onAttemptIncrement } = useAttemptCounter("sopa_de_letras", id || "");
  const [progress, setProgress] = useState<ProgressSnapshot>({ correctItems: [], total: 0, completed: false });
  const live = useLiveProgress(id, "word-search", progress);

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
      <WordSearchGame
        grid={decoded.grid}
        size={decoded.size}
        words={decoded.words}
        title={decoded.title}
        attemptCount={attemptCount}
        onAttemptIncrement={onAttemptIncrement}
        onProgress={setProgress}
      />
      {!live.confirmed && <StudentIdentityModal alias={live.alias} onConfirm={live.confirm} />}
    </div>
  );
}
