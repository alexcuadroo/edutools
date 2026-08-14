import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import RoscoGame from "@/components/playable/RoscoGame";
import { useAttemptCounter } from "@/hooks/useAttemptCounter";
import { usePuzzleLoader } from "@/hooks/usePuzzleLoader";
import type { RoscoPlayData } from "@/lib/share/types";
import { useLiveProgress } from "@/hooks/useLiveProgress";
import { StudentIdentityModal } from "@/components/playable/StudentIdentityModal";
import type { ProgressSnapshot } from "@/lib/progress/types";

export default function PlayRoscoPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = usePuzzleLoader(id, (puzzle) => { const rosco = puzzle as RoscoPlayData; return { entries: rosco.e.map((entry) => ({ letter: entry.l, answer: entry.a, clue: entry.c, rule: entry.r })), durationSeconds: rosco.d, title: rosco.t }; });
  const { count, increment } = useAttemptCounter("rosco", id || "");
  const [progress, setProgress] = useState<ProgressSnapshot>({ correctItems: [], total: 0, completed: false });
  const live = useLiveProgress(id, "rosco", progress);
  if (loading) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 animate-spin text-indigo-400" /><p className="text-gray-500">Cargando rosco...</p></div>;
  if (error || !data) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"><AlertCircle className="h-12 w-12 text-red-400" /><h1 className="text-xl font-bold text-gray-900">Rosco no encontrado</h1><p className="max-w-sm text-gray-500">El link no es válido o ha expirado.</p><Link to="/" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link></div>;
  return <div className="py-4"><Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link><RoscoGame entries={data.entries} durationSeconds={data.durationSeconds} title={data.title} attemptCount={count} onAttemptIncrement={increment} onProgress={setProgress} />{!live.confirmed && <StudentIdentityModal alias={live.alias} onConfirm={live.confirm} />}</div>;
}
