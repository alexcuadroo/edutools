import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSavedPuzzlesStore } from "@/store/saved-puzzles-store";
import type { PlayablePuzzleType } from "@/lib/share/types";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { setPendingPuzzleSave } from "@/lib/share/pending-puzzle-save";

interface SavePuzzleButtonProps {
  type: PlayablePuzzleType;
  title: string;
  data: unknown;
}

export default function SavePuzzleButton({ type, title, data }: SavePuzzleButtonProps) {
  const { status } = useAuth();
  const { save } = useSavedPuzzlesStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (status === "anon") {
      setPendingPuzzleSave({ type, title: title || "Sin título", data });
      toast.info("Iniciá sesión para guardar puzzles");
      navigate("/iniciar-sesion");
      return;
    }

    setLoading(true);
    try {
      await save(type, title || "Sin título", data);
      toast.success("Puzzle guardado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar el puzzle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors border border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
      {loading ? "Guardando..." : "Guardar"}
    </button>
  );
}
