import { useState } from "react";
import Card from "../../ui/Card";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateCrosswordPDF } from "../../../lib/pdf/crossword";
import { downloadCrosswordPNG } from "../../../lib/png/crossword";
import DownloadDropdown from "../../ui/DownloadDropdown";
import ShareModal from "../../ui/ShareModal";
import { Eye, Share2, Loader2 } from "lucide-react";
import { savePuzzle, buildPlayUrl } from "../../../lib/share/api";
import { cwGridToPlayData } from "../../../lib/share/types";
import { toast } from "react-toastify";

export default function CrosswordPreview() {
  const { crosswordResult, crosswordTitle } = usePuzzleStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const grid = crosswordResult;

  const handleShare = async () => {
    if (!grid || sharing) return;
    setSharing(true);
    try {
      const data = cwGridToPlayData(grid, crosswordTitle);
      const id = await savePuzzle({ type: "crossword", puzzle: data });
      const url = buildPlayUrl("crucigrama", id);
      setShareUrl(url);
      setShareOpen(true);
    } catch {
      toast.error("No se pudo generar el link para compartir");
    } finally {
      setSharing(false);
    }
  };

  if (!grid) return null;

  const cellSize = Math.min(36, 280 / grid.cols);
  const across = grid.words.filter((w) => w.direction === "across");
  const down = grid.words.filter((w) => w.direction === "down");

  return (
    <div className="space-y-6">
      <Card className="overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Previsualización</h2>
          <div className="flex items-center gap-2">
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
                    { label: "Ver en navegador", icon: Eye, onClick: () => generateCrosswordPDF(grid, "blank", crosswordTitle, "preview") },
                    { label: "Descargar con pistas", onClick: () => generateCrosswordPDF(grid, "blank", crosswordTitle, "download") },
                    { label: "Descargar con soluciones", onClick: () => generateCrosswordPDF(grid, "solution", crosswordTitle, "download") },
                  ],
                },
                {
                  label: "PNG",
                  options: [
                    { label: "Con pistas", onClick: () => downloadCrosswordPNG(grid, "blank", crosswordTitle) },
                    { label: "Con soluciones", onClick: () => downloadCrosswordPNG(grid, "solution", crosswordTitle) },
                  ],
                },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-center bg-white">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
              gap: 0,
            }}
          >
            {grid.grid.map((row, r) =>
              row.map((cell, c) => {
                const isBlack = cell === null;
                const num = grid.numbers.get(`${r},${c}`);

                return (
                  <div
                    key={`${r}-${c}`}
                    className="flex items-center justify-center font-mono select-none relative"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: isBlack ? "#e5e5e5" : "white",
                      border: "1px solid #ddd",
                      fontSize: cellSize * 0.55,
                    }}
                  >
                    {!isBlack && cell}
                    {!isBlack && num !== undefined && (
                      <span
                        className="absolute top-0 left-0.5 leading-none"
                        style={{ fontSize: cellSize * 0.3 }}
                      >
                        {num}
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        {across.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Horizontales</h3>
            <ul className="space-y-1.5">
              {across.map((w) => (
                <li key={w.number} className="text-sm flex gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">{w.number}.</span>
                  <span>{w.clue}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {down.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Verticales</h3>
            <ul className="space-y-1.5">
              {down.map((w) => (
                <li key={w.number} className="text-sm flex gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">{w.number}.</span>
                  <span>{w.clue}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={crosswordTitle || "Crucigrama"}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
