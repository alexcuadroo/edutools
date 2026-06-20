import { useState } from "react";
import Card from "../../ui/Card";
import ShareModal from "../../ui/ShareModal";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateMatchColumnsPDF } from "../../../lib/pdf/match-columns.ts";
import DownloadDropdown from "../../ui/DownloadDropdown";
import { savePuzzle, buildPlayUrl } from "../../../lib/share/api";
import { matchColumnsResultToPlayData } from "../../../lib/share/types";
import { Eye, Share2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import MatchColumnsGame from "../../playable/MatchColumnsGame";

export default function MatchColumnsPreview() {
  const { matchColumnsResult, matchColumnsTitle } = usePuzzleStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  if (!matchColumnsResult) return null;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const data = matchColumnsResultToPlayData(matchColumnsResult, matchColumnsTitle);
      const id = await savePuzzle({ type: "match-columns", puzzle: data });
      const url = buildPlayUrl("relacionar-columnas", id);
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
                    { label: "Ver en navegador", icon: Eye, onClick: () => generateMatchColumnsPDF(matchColumnsResult, "students", matchColumnsTitle, "preview") },
                    { label: "Descargar sin soluciones", onClick: () => generateMatchColumnsPDF(matchColumnsResult, "students", matchColumnsTitle, "download") },
                    { label: "Descargar con soluciones", onClick: () => generateMatchColumnsPDF(matchColumnsResult, "solution", matchColumnsTitle, "download") },
                  ],
                },
              ]}
            />
          </div>
        </div>

        <MatchColumnsGame
          key={matchColumnsResult.matches.map((m) => m.word).join(",")}
          matches={matchColumnsResult.matches}
          shuffledDefinitions={matchColumnsResult.shuffledDefinitions}
          title={matchColumnsTitle}
        />
      </Card>

      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={matchColumnsTitle || "Relacionar Columnas"}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
