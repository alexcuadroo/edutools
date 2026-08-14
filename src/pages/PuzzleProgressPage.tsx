import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleDot, RefreshCw, Trash2, Users } from "lucide-react";
import type { ProgressEntry } from "@/lib/progress/types";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function PuzzleProgressPage() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const load = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/puzzles/saved/${id}/progreso`);
      if (!response.ok) throw new Error("No se pudo cargar el progreso");
      setEntries(await response.json() as ProgressEntry[]);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Error al cargar el progreso"); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const initial = window.setTimeout(() => void load(), 0); const timer = window.setInterval(() => { void load(); setNow(Date.now()); }, 4_000); return () => { window.clearTimeout(initial); window.clearInterval(timer); }; }, [load]);
  const clearProgress = async () => { if (!id) return; setClearing(true); try { const response = await fetch(`/api/puzzles/saved/${id}/progreso`, { method: "DELETE" }); if (!response.ok) throw new Error(); setEntries([]); setClearOpen(false); } catch { setError("No se pudo borrar el progreso"); } finally { setClearing(false); } };
  const active = entries.filter((entry) => now - entry.updatedAt < 20_000).length;
  return <div className="mx-auto max-w-4xl px-4 py-8"><Link to="/mis-puzzles" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Mis puzzles</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Progreso en vivo</h1><p className="mt-1 text-sm text-gray-500">Se actualiza automáticamente cada 4 segundos.</p></div><div className="flex gap-2"><button onClick={() => void load()} className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Actualizar</button><button onClick={() => setClearOpen(true)} disabled={entries.length === 0} className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="h-4 w-4" /> Borrar progreso</button></div></div><div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900"><Users className="mr-2 inline h-5 w-5" /><strong>{entries.length}</strong> estudiante{entries.length === 1 ? "" : "s"} · <strong>{active}</strong> activo{active === 1 ? "" : "s"}</div>{error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{!loading && !error && entries.length === 0 && <p className="mt-8 text-center text-gray-500">Aún no hay estudiantes en esta actividad.</p>}<div className="mt-5 space-y-3">{entries.map((entry) => { const isActive = now - entry.updatedAt < 20_000; return <article key={entry.participantId} className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900">{entry.alias}</h2><p className="mt-1 text-sm text-gray-600">{entry.correctItems.length}/{entry.total} correctas{entry.incorrectItems.length > 0 && ` · ${entry.incorrectItems.length} incorrectas`}</p></div><div className="flex items-center gap-2 text-sm font-medium"><span className={`inline-flex items-center gap-1 ${isActive ? "text-emerald-700" : "text-gray-500"}`}><CircleDot className="h-4 w-4" />{isActive ? "Activo" : "Inactivo"}</span>{entry.completed && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Completó</span>}</div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${entry.total ? Math.round(entry.correctItems.length / entry.total * 100) : 0}%` }} /></div>{entry.correctItems.length > 0 && <p className="mt-3 text-xs text-gray-500">Correctas: {entry.correctItems.join(", ")}</p>}</article>; })}</div><ConfirmModal open={clearOpen} onClose={() => setClearOpen(false)} title="Borrar progreso" description="Se eliminará el progreso de todos los estudiantes de esta actividad. No se puede deshacer." confirmLabel={clearing ? "Borrando..." : "Borrar progreso"} tone="danger" onConfirm={clearProgress} loading={clearing} /></div>;
}
