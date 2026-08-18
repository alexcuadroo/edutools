import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import WordleGame from "@/components/playable/WordleGame";
import { usePuzzleLoader } from "@/hooks/usePuzzleLoader";
import type { WordlePlayData } from "@/lib/share/types";
import { useLiveProgress } from "@/hooks/useLiveProgress";
import { StudentIdentityModal } from "@/components/playable/StudentIdentityModal";
import { StudentAliasBadge } from "@/components/playable/StudentAliasBadge";
import type { ProgressSnapshot } from "@/lib/progress/types";

export default function PlayWordlePage() { const { id } = useParams<{ id: string }>(); const { data, loading, error } = usePuzzleLoader(id, (puzzle) => { const wordle = puzzle as WordlePlayData; return { words: wordle.p?.map((entry) => ({ word: entry.w, clue: entry.c })) ?? [{ word: wordle.w, clue: wordle.c }], title: wordle.t }; }); const [progress, setProgress] = useState<ProgressSnapshot>({ correctItems: [], total: 0, completed: false }); const live = useLiveProgress(id, "wordle", progress); if (loading) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 animate-spin text-indigo-400" /><p className="text-gray-500">Cargando juego...</p></div>; if (error || !data) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"><AlertCircle className="h-12 w-12 text-red-400" /><h1 className="text-xl font-bold text-gray-900">Juego no encontrado</h1><Link to="/" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link></div>; return <div className="py-4"><div className="mb-4 flex justify-between"><Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link>{live.confirmed && <StudentAliasBadge alias={live.alias} />}</div><WordleGame words={data.words} title={data.title} onProgress={setProgress} />{!live.confirmed && <StudentIdentityModal alias={live.alias} onConfirm={live.confirm} />}</div>; }
