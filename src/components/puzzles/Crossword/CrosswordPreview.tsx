import type { CWGrid } from "../../../lib/puzzles/crossword/types";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateCrosswordPDF } from "../../../lib/pdf/crossword";

export default function CrosswordPreview() {
  const { crosswordResult } = usePuzzleStore();

  const grid = crosswordResult as CWGrid | null;
  if (!grid) {
    return null;
  }

  const cellSize = Math.min(40, 500 / grid.cols);
  const across = grid.words.filter((w) => w.direction === "across");
  const down = grid.words.filter((w) => w.direction === "down");

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
                onClick={() => generateCrosswordPDF(grid, "blank")}
                className={`${btnBase} bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Con pistas
              </button>
              <button
                onClick={() => generateCrosswordPDF(grid, "solution")}
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
