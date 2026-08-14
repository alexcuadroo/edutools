import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import CrosswordGame from "@/components/playable/CrosswordGame";
import {
  type CWPlayData,
  playDataToCWWords,
  playDataToCWNumbers,
} from "@/lib/share/types";
import { usePuzzleLoader } from "@/hooks/usePuzzleLoader";
import { useAttemptCounter } from "@/hooks/useAttemptCounter";
import { useLiveProgress } from "@/hooks/useLiveProgress";
import { StudentIdentityModal } from "@/components/playable/StudentIdentityModal";
import { StudentAliasBadge } from "@/components/playable/StudentAliasBadge";
import type { ProgressSnapshot } from "@/lib/progress/types";

export default function PlayCrosswordPage() {
  const { id } = useParams<{ id: string }>();
  const { data: decoded, loading, error } = usePuzzleLoader(id, (puzzle) => {
    const d = puzzle as CWPlayData;
    return {
      grid: d.g,
      rows: d.r,
      cols: d.c,
      words: playDataToCWWords(d),
      numbers: playDataToCWNumbers(d),
      title: d.t,
    };
  });

  const { count: attemptCount, increment: onAttemptIncrement } = useAttemptCounter("crucigrama", id || "");
  const [progress, setProgress] = useState<ProgressSnapshot>({ correctItems: [], total: 0, completed: false });
  const live = useLiveProgress(id, "crossword", progress);

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        {live.confirmed && <StudentAliasBadge alias={live.alias} />}
      </div>
      <CrosswordGame
        grid={decoded.grid}
        rows={decoded.rows}
        cols={decoded.cols}
        words={decoded.words}
        numbers={decoded.numbers}
        title={decoded.title}
        attemptCount={attemptCount}
        onAttemptIncrement={onAttemptIncrement}
        onProgress={setProgress}
      />
      {!live.confirmed && <StudentIdentityModal alias={live.alias} onConfirm={live.confirm} />}
    </div>
  );
}
