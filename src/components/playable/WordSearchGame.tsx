import { useState, useCallback, useMemo } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import type { PlayableWSWord } from "../../lib/share/types";

interface WordSearchGameProps {
  grid: string[][];
  size: number;
  words: PlayableWSWord[];
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

interface Cell {
  row: number;
  col: number;
}

function snapDirection(from: Cell, to: Cell): [number, number] | null {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (dr === 0 && dc === 0) return null;

  const rowDir = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const colDir = dc === 0 ? 0 : dc > 0 ? 1 : -1;

  return [rowDir, colDir];
}

function getCellsInLine(start: Cell, dir: [number, number], distance: number, size: number): Cell[] {
  const cells: Cell[] = [];
  for (let i = 0; i <= distance; i++) {
    const r = start.row + dir[0] * i;
    const c = start.col + dir[1] * i;
    if (r < 0 || r >= size || c < 0 || c >= size) break;
    cells.push({ row: r, col: c });
  }
  return cells;
}

function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

export default function WordSearchGame({ grid, size, words, title, attemptCount, onAttemptIncrement }: WordSearchGameProps) {
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Map<string, string>>(new Map());
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);

  const allFound = foundWords.size === words.length;
  const celebration = allFound && foundWords.size > 0;

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (allFound) return;

      if (!startCell) {
        setStartCell({ row, col });
        setSelectedCells([{ row, col }]);
        return;
      }

      const endCell = { row, col };
      const dir = snapDirection(startCell, endCell);
      if (!dir) {
        setStartCell(null);
        setSelectedCells([]);
        return;
      }

      const distance = Math.max(Math.abs(endCell.row - startCell.row), Math.abs(endCell.col - startCell.col));
      const cells = getCellsInLine(startCell, dir, distance, size);
      setSelectedCells(cells);

      const selected = cells.map((c) => grid[c.row]![c.col]).join("");
      const reversed = selected.split("").reverse().join("");

      let matchedWord: string | null = null;
      for (const word of words) {
        if (foundWords.has(word.word)) continue;
        if (selected === word.word || reversed === word.word) {
          matchedWord = word.word;
          break;
        }
      }

      if (matchedWord) {
        const newFound = new Set(foundWords);
        newFound.add(matchedWord);
        setFoundWords(newFound);

        const newFoundCells = new Map(foundCells);
        for (const cell of cells) {
          newFoundCells.set(cellKey(cell.row, cell.col), matchedWord);
        }
        setFoundCells(newFoundCells);
      }

      setStartCell(null);
      setSelectedCells([]);
    },
    [allFound, startCell, grid, words, foundWords, foundCells, size]
  );

  const handleReset = useCallback(() => {
    setFoundWords(new Set());
    setFoundCells(new Map());
    setStartCell(null);
    setSelectedCells([]);
    onAttemptIncrement?.();
  }, [onAttemptIncrement]);

  const selectedSet = useMemo(
    () => new Set(selectedCells.map((c) => cellKey(c.row, c.col))),
    [selectedCells]
  );

  const cellSize = useMemo(() => Math.min(40, 360 / size), [size]);

  return (
    <div className="space-y-6">
      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      {celebration && (
        <div className="text-center py-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-700">Felicidades!</p>
          <p className="text-sm text-green-600">Encontraste todas las palabras</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
        {attemptCount !== undefined && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Intento #{attemptCount}
          </span>
        )}
        <button
          onClick={handleReset}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 overflow-x-auto">
          <div
            className="inline-grid select-none"
            style={{
              gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
              gap: 0,
            }}
          >
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const key = cellKey(r, c);
                const isSelected = selectedSet.has(key);
                const found = foundCells.get(key);

                let bgColor = "white";
                let textColor = "text-gray-800";
                let scale = "";

                if (isSelected && !found) {
                  bgColor = "#c7d2fe";
                  scale = "scale-110";
                } else if (found) {
                  const colors = [
                    "#bbf7d0", "#bfdbfe", "#fde68a", "#fbcfe8",
                    "#c4b5fd", "#a7f3d0", "#fed7aa", "#99f6e4",
                  ];
                  const idx = words.findIndex((w) => w.word === found);
                  bgColor = colors[idx % colors.length]!;
                  textColor = "text-gray-900";
                }

                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    aria-label={`Letra ${letter}, fila ${r + 1}, columna ${c + 1}`}
                    onClick={() => handleCellClick(r, c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCellClick(r, c);
                      }
                    }}
                    className={`flex items-center justify-center font-mono font-bold border border-gray-200 transition-all duration-100 cursor-pointer ${textColor} ${scale}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      fontSize: cellSize * 0.5,
                      backgroundColor: bgColor,
                    }}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Palabras</h3>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {foundWords.size}/{words.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {words.map((word) => {
            const isFound = foundWords.has(word.word);
            return (
              <span
                key={word.word}
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-semibold transition-all ${
                  isFound
                    ? "bg-green-100 text-green-700 line-through"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
