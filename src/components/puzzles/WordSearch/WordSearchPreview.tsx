import { useState } from "react";
import Card from "@/components/ui/Card";
import type { WSGrid, WSWordPlacement } from "@/lib/puzzles/word-search/types";
import { WS_DIRECTION_LABELS, type WSDirection } from "@/lib/puzzles/word-search/types";
import { usePuzzleStore } from "@/store/puzzle-store";
import { generateWordSearchPDF } from "@/lib/pdf/word-search";
import { downloadWordSearchPNG } from "@/lib/png/word-search";
import DownloadDropdown from "@/components/ui/DownloadDropdown";
import ShareModal from "@/components/ui/ShareModal";
import { Eye, Share2, Loader2 } from "lucide-react";
import { savePuzzle, buildPlayUrl } from "@/lib/share/api";
import { wsGridToPlayData } from "@/lib/share/types";
import { toast } from "react-toastify";

function getSolutionCells(grid: WSGrid): Set<string> {
  const cells = new Set<string>();
  for (const w of grid.words) {
    let d: [number, number] = [0, 0];
    if (w.direction === "right") d = [0, 1];
    if (w.direction === "down") d = [1, 0];
    if (w.direction === "left") d = [0, -1];
    if (w.direction === "up") d = [-1, 0];
    if (w.direction === "diag-down-right") d = [1, 1];
    if (w.direction === "diag-up-right") d = [-1, 1];
    if (w.direction === "diag-down-left") d = [1, -1];
    if (w.direction === "diag-up-left") d = [-1, -1];

    for (let i = 0; i < w.word.length; i++) {
      cells.add(`${w.startRow + d[0] * i},${w.startCol + d[1] * i}`);
    }
  }
  return cells;
}

function directionLetter(dir: string): string {
  return WS_DIRECTION_LABELS[dir as WSDirection] ?? dir.substring(0, 1).toUpperCase();
}

export default function WordSearchPreview() {
  const { wordSearchResult, wordSearchTitle } = usePuzzleStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const grid = wordSearchResult;

  const handleShare = async () => {
    if (!grid || sharing) return;
    setSharing(true);
    try {
      const data = wsGridToPlayData(grid, wordSearchTitle);
      const id = await savePuzzle({ type: "word-search", puzzle: data });
      const url = buildPlayUrl("sopa-de-letras", id);
      setShareUrl(url);
      setShareOpen(true);
    } catch {
      toast.error("No se pudo generar el link para compartir");
    } finally {
      setSharing(false);
    }
  };

  if (!grid) return null;

  const solutionCells = getSolutionCells(grid);
  const cellSize = Math.min(36, 280 / grid.size);

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
                    { label: "Ver en navegador", icon: Eye, onClick: () => generateWordSearchPDF(grid, "students", wordSearchTitle, "preview") },
                    { label: "Descargar sin soluciones", onClick: () => generateWordSearchPDF(grid, "students", wordSearchTitle, "download") },
                    { label: "Descargar con soluciones", onClick: () => generateWordSearchPDF(grid, "solution", wordSearchTitle, "download") },
                  ],
                },
                {
                  label: "PNG",
                  options: [
                    { label: "Sin soluciones", onClick: () => downloadWordSearchPNG(grid, "students", wordSearchTitle) },
                    { label: "Con soluciones", onClick: () => downloadWordSearchPNG(grid, "solution", wordSearchTitle) },
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
              gridTemplateColumns: `repeat(${grid.size}, ${cellSize}px)`,
              gap: 0,
            }}
          >
            {grid.grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className="flex items-center justify-center font-mono border border-gray-200 select-none"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    fontSize: cellSize * 0.55,
                    backgroundColor: solutionCells.has(`${r},${c}`) ? "#dbeafe" : "white",
                  }}
                >
                  {cell}
                </div>
              )),
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Palabras a buscar</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {grid.words.map((w: WSWordPlacement, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm px-2 py-1">
              <span className="font-mono font-semibold text-indigo-600">{w.word}</span>
              <span className="text-gray-400 text-xs">{directionLetter(w.direction)}</span>
            </div>
          ))}
        </div>
      </Card>

      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={wordSearchTitle || "Sopa de Letras"}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
