import { useState } from "react";
import Card from "@/components/ui/Card";
import ShareModal from "@/components/ui/ShareModal";
import SavePuzzleButton from "@/components/auth/SavePuzzleButton";
import { usePuzzleStore } from "@/store/puzzle-store";
import { generateMemoryPDF } from "@/lib/pdf/memory.ts";
import DownloadDropdown from "@/components/ui/DownloadDropdown";
import { savePuzzle, buildPlayUrl } from "@/lib/share/api";
import { memoryResultToPlayData } from "@/lib/share/types";
import { Eye, Share2, Loader2 } from "lucide-react";
import MemoryGame from "@/components/playable/MemoryGame";
import { toast } from "react-toastify";

export default function MemoryPreview() {
  const { memoryResult, memoryTitle } = usePuzzleStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  if (!memoryResult) return null;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const data = memoryResultToPlayData(memoryResult, memoryTitle);
      const id = await savePuzzle({ type: "memory", puzzle: data });
      const url = buildPlayUrl("memoria", id);
      setShareUrl(url);
      setShareOpen(true);
    } catch {
      toast.error("No se pudo generar el link para compartir");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Juego interactivo</h2>
          <div className="flex items-center gap-3">
            <SavePuzzleButton
              type="memory"
              title={memoryTitle || "Memoria"}
              data={memoryResultToPlayData(memoryResult, memoryTitle)}
            />
            <button
              onClick={handleShare}
              disabled={sharing}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors border border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              {sharing ? "Generando..." : "Compartir"}
            </button>
            <DownloadDropdown
              groups={[
                {
                  label: "PDF",
                  options: [
                    { label: "Ver en navegador", icon: Eye, onClick: () => generateMemoryPDF(memoryResult, "students", memoryTitle, "preview") },
                    { label: "Descargar sin soluciones", onClick: () => generateMemoryPDF(memoryResult, "students", memoryTitle, "download") },
                    { label: "Descargar con soluciones", onClick: () => generateMemoryPDF(memoryResult, "solution", memoryTitle, "download") },
                  ],
                },
              ]}
            />
          </div>
        </div>

        <MemoryGame
          key={memoryResult.cards.map((c) => c.id).join(",")}
          cards={memoryResult.cards}
          pairs={memoryResult.pairs}
          title={memoryTitle}
        />
      </Card>

      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={memoryTitle || "Memoria"}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
