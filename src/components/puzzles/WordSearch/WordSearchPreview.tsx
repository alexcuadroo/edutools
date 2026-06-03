import Card from "../../ui/Card";
import type { WSGrid, WSWordPlacement } from "../../../lib/puzzles/word-search/types";
import { WS_DIRECTION_LABELS, type WSDirection } from "../../../lib/puzzles/word-search/types";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateWordSearchPDF } from "../../../lib/pdf/word-search";
import { downloadWordSearchPNG } from "../../../lib/png/word-search";
import DownloadDropdown from "../../ui/DownloadDropdown";
import { Eye } from "lucide-react";

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
  const grid = wordSearchResult;
  if (!grid) return null;

  const solutionCells = getSolutionCells(grid);
  const cellSize = Math.min(36, 280 / grid.size);

  return (
    <div className="space-y-6">
      <Card className="overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Previsualización</h2>
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
    </div>
  );
}
