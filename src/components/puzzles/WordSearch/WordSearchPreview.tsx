import type { WSGrid, WSWordPlacement } from "../../../lib/puzzles/word-search/types";
import { WS_DIRECTION_LABELS, type WSDirection } from "../../../lib/puzzles/word-search/types";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateWordSearchPDF } from "../../../lib/pdf/word-search";

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
  return (
    WS_DIRECTION_LABELS[dir as WSDirection] ?? dir.substring(0, 1).toUpperCase()
  );
}

export default function WordSearchPreview() {
  const { wordSearchResult } = usePuzzleStore();

  const grid = wordSearchResult as WSGrid | null;
  if (!grid) {
    return null;
  }

  const solutionCells = getSolutionCells(grid);
  const cellSize = Math.min(40, 500 / grid.size);

  const btnBase =
    "cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Previsualización
          </h2>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
              Descargar PDF
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => generateWordSearchPDF(grid, "students")}
                className={`${btnBase} bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sin pistas
              </button>
              <button
                onClick={() => generateWordSearchPDF(grid, "clues")}
                className={`${btnBase} bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Con pistas
              </button>
              <button
                onClick={() => generateWordSearchPDF(grid, "solution")}
                className={`${btnBase} bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Con soluciones
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
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
                    backgroundColor: solutionCells.has(`${r},${c}`)
                      ? "#dbeafe"
                      : "white",
                  }}
                >
                  {cell}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Palabras a buscar
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {grid.words.map((w: WSWordPlacement, i: number) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-gray-50"
            >
              <span className="font-mono font-semibold text-indigo-600">
                {w.word}
              </span>
              <span className="text-gray-400 text-xs">
                {directionLetter(w.direction)}
              </span>
              {w.clue && (
                <span className="text-gray-500 text-xs truncate">
                  — {w.clue}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
