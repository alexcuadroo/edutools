import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import SentenceOrderGame from "../../components/playable/SentenceOrderGame";
import { decodePuzzleData } from "../../lib/share/encoder";
import type { SOPlayData } from "../../lib/share/types";
import { useAttemptCounter } from "../../hooks/useAttemptCounter";

function decodeHash(hash: string): { sentences: { original: string; shuffled: string[] }[]; title?: string } | null {
  if (!hash) return null;
  try {
    const data = decodePuzzleData<SOPlayData>(hash);
    return {
      sentences: data.s.map((s) => ({ original: s.o, shuffled: s.w })),
      title: data.t,
    };
  } catch {
    return null;
  }
}

export default function PlaySentenceOrderPage() {
  const hash = useMemo(() => window.location.hash.slice(1), []);
  const { count: attemptCount, increment: onAttemptIncrement } = useAttemptCounter("ordenar_oracion", hash);
  const [decoded] = useState(() => decodeHash(hash));

  if (!decoded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h1 className="text-xl font-bold text-gray-900">Puzzle no encontrado</h1>
        <p className="text-gray-500 max-w-sm">
          El link del puzzle no es válido o está dañado. Pídele al anfitrión que
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
      <SentenceOrderGame sentences={decoded.sentences} title={decoded.title} attemptCount={attemptCount} onAttemptIncrement={onAttemptIncrement} />
    </div>
  );
}
