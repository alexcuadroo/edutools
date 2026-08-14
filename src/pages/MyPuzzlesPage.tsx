import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNoIndexMeta } from "@/hooks/useNoIndexMeta";
import { useSavedPuzzlesStore } from "@/store/saved-puzzles-store";
import { Loader2, Trash2, Share2, Play, FolderOpen, AlertCircle, ChartNoAxesCombined } from "lucide-react";
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis puzzles</h1>

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

      {puzzles.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Todavía no guardaste ningún puzzle
          </h2>
          <p className="text-gray-500 mb-6">
            Generá un puzzle y hacé click en "Guardar" para tenerlo acá.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Crear puzzle
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {puzzles.map((puzzle) => (
            <div
              key={puzzle.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{puzzle.title}</h3>
                <p className="text-sm text-gray-500">
                  {puzzleTypeLabel(puzzle.type)} · {formatRelativeTime(puzzle.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/jugar/${puzzleTypeSlug(puzzle.type as PlayablePuzzleType)}/${puzzle.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Jugar
                </Link>
                {(["word-search", "crossword", "rosco"] as string[]).includes(puzzle.type) && (
                  <Link to={`/mis-puzzles/${puzzle.id}/progreso`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors" title="Ver progreso en vivo">
                    <ChartNoAxesCombined className="w-4 h-4" /> Progreso
                  </Link>
                )}
                <button
                  onClick={() => handleShare(puzzle.id)}
                  disabled={sharing === puzzle.id}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {sharing === puzzle.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  Compartir
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: puzzle.id, title: puzzle.title })}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
