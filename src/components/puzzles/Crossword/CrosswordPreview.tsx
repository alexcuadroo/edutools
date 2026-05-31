import type { CWGrid } from "../../../lib/puzzles/crossword/types";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateCrosswordPDF } from "../../../lib/pdf/crossword";
import { downloadCrosswordPNG } from "../../../lib/png/crossword";
import DownloadDropdown from "../../ui/DownloadDropdown";

export default function CrosswordPreview() {
  const { crosswordResult } = usePuzzleStore();
  const grid = crosswordResult as CWGrid | null;
  if (!grid) {
    return null;
  }

  const cellSize = Math.min(40, 500 / grid.cols);
  const across = grid.words.filter((w) => w.direction === "across");
  const down = grid.words.filter((w) => w.direction === "down");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Previsualización
          </h2>
          <DownloadDropdown
            groups={[
              {
                label: "PDF",
                options: [
                  { label: "Con pistas", onClick: () => generateCrosswordPDF(grid, "blank") },
                  { label: "Con soluciones", onClick: () => generateCrosswordPDF(grid, "solution") },
                ],
              },
              {
                label: "PNG",
                options: [
                  { label: "Con pistas", onClick: () => downloadCrosswordPNG(grid, "blank") },
                  { label: "Con soluciones", onClick: () => downloadCrosswordPNG(grid, "solution") },
                ],
              },
            ]}
          />
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
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {across.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Horizontales
            </h3>
            <ul className="space-y-1.5">
              {across.map((w, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">
                    {w.number}.
                  </span>
                  <span>{w.clue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {down.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Verticales
            </h3>
            <ul className="space-y-1.5">
              {down.map((w, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">
                    {w.number}.
                  </span>
                  <span>{w.clue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
