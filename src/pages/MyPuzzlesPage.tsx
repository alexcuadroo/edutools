import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNoIndexMeta } from "@/hooks/useNoIndexMeta";
import { useSavedPuzzlesStore } from "@/store/saved-puzzles-store";
import { Loader2, Trash2, Share2, Play, FolderOpen, AlertCircle, ChartNoAxesCombined, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import ShareModal from "@/components/ui/ShareModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { puzzleTypeSlug, puzzleTypeLabel } from "@/lib/puzzles/slugs";
import type { PlayablePuzzleType } from "@/lib/share/types";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  return "hace un momento";
}

export default function MyPuzzlesPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const { puzzles, loading, error, fetch, remove, share } = useSavedPuzzlesStore();
  const [shareUrl, setShareUrl] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useNoIndexMeta("Mis puzzles");

  useEffect(() => {
    if (status === "anon") {
      navigate("/iniciar-sesion");
      return;
    }
    if (status === "auth") {
      fetch();
    }
  }, [status, navigate, fetch]);

  const handleShare = async (puzzleId: string) => {
    setSharing(puzzleId);
    try {
      const result = await share(puzzleId);
      setShareUrl(result.url);
      setShareOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al compartir");
    } finally {
      setSharing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      toast.success("Puzzle eliminado");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (status === "anon") {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-700">Biblioteca personal - BETA</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">Mis puzzles</h1>
          <p className="mt-2 text-sm text-gray-600">
            {puzzles.length === 1 ? "1 actividad guardada" : `${puzzles.length} actividades guardadas`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetch()}
          disabled={loading}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="flex-1 text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetch()}
            className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-900 underline shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && puzzles.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-indigo-200 bg-white px-6 py-16 text-center shadow-sm" aria-labelledby="empty-puzzles-title">
          <FolderOpen className="mx-auto mb-4 h-14 w-14 text-indigo-300" aria-hidden="true" />
          <h2 id="empty-puzzles-title" className="mb-2 text-xl font-semibold text-gray-700">
            Todavía no guardaste ningún puzzle
          </h2>
          <p className="text-gray-500 mb-6">
            Generá un puzzle y hacé click en "Guardar" para tenerlo acá.
          </p>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Crear puzzle
          </Link>
        </section>
      ) : (
        <ul className="grid gap-3" aria-label="Puzzles guardados" aria-busy={loading}>
          {puzzles.map((puzzle) => (
            <li
              key={puzzle.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <article className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-gray-950">{puzzle.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {puzzleTypeLabel(puzzle.type)} <span aria-hidden="true">·</span> {formatRelativeTime(puzzle.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Link
                  to={`/jugar/${puzzleTypeSlug(puzzle.type as PlayablePuzzleType)}/${puzzle.id}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Jugar
                </Link>
                {(["word-search", "crossword", "rosco", "fill-blanks", "match-columns", "memory", "wordle"] as string[]).includes(puzzle.type) && (
                  <Link to={`/mis-puzzles/${puzzle.id}/progreso`} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-violet-50 px-3.5 py-2 text-sm font-medium text-violet-800 transition-colors hover:bg-violet-100">
                    <ChartNoAxesCombined className="h-4 w-4" aria-hidden="true" /> Progreso
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleShare(puzzle.id)}
                  disabled={sharing !== null || deleting}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sharing === puzzle.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  {sharing === puzzle.id ? "Compartiendo..." : "Compartir"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ id: puzzle.id, title: puzzle.title })}
                  disabled={sharing !== null || deleting}
                  aria-label={`Eliminar ${puzzle.title}`}
                  title={`Eliminar ${puzzle.title}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-red-50 p-2 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title="Puzzle compartido"
          onClose={() => setShareOpen(false)}
        />
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar puzzle"
        description="¿Seguro que querés eliminar este puzzle?"
        confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
        tone="danger"
        onConfirm={handleDelete}
        loading={deleting}
      >
        {deleteTarget && (
          <p className="text-sm text-gray-700">
            <strong className="font-semibold">{deleteTarget.title}</strong> se borrará
            permanentemente de tu cuenta.
          </p>
        )}
      </ConfirmModal>
    </div>
  );
}
