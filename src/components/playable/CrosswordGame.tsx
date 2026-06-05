import { useState, useRef } from "react";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";
import type { PlayableCWWord } from "../../lib/share/types";

interface CrosswordGameProps {
  grid: (string | null)[][];
  rows: number;
  cols: number;
  words: PlayableCWWord[];
  numbers: Map<string, number>;
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

interface CellPos {
  row: number;
  col: number;
}

function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

export default function CrosswordGame({
  grid,
  rows,
  cols,
  words,
  numbers,
  title,
  attemptCount,
  onAttemptIncrement,
}: CrosswordGameProps) {
  const [userGrid, setUserGrid] = useState<(string | null)[][]>(() =>
    grid.map((row) => row.map((cell) => (cell === null ? null : "")))
  );
  const [activeCell, setActiveCell] = useState<CellPos | null>(null);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [cellStatus, setCellStatus] = useState<("correct" | "incorrect" | null)[][]>(() =>
    Array.from({ length: rows }, () => Array(cols).fill(null))
  );
  const [celebration, setCelebration] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const across = words.filter((w) => w.direction === "across");
  const down = words.filter((w) => w.direction === "down");

  const getWordCells = (word: PlayableCWWord): CellPos[] => {
    const cells: CellPos[] = [];
    for (let i = 0; i < word.word.length; i++) {
      cells.push({
        row: word.startRow + (word.direction === "down" ? i : 0),
        col: word.startCol + (word.direction === "across" ? i : 0),
      });
    }
    return cells;
  };

  const findWordAtCell = (row: number, col: number, dir: "across" | "down"): number | null => {
    const idx = words.findIndex(
      (w) =>
        w.direction === dir &&
        getWordCells(w).some((c) => c.row === row && c.col === col)
    );
    return idx >= 0 ? idx : null;
  };

  const moveToNext = (row: number, col: number) => {
    const dr = direction === "down" ? 1 : 0;
    const dc = direction === "across" ? 1 : 0;
    const nr = row + dr;
    const nc = col + dc;
    if (nr < rows && nc < cols && grid[nr][nc] !== null) {
      setActiveCell({ row: nr, col: nc });
    }
  };

  const moveToPrev = (row: number, col: number) => {
    const dr = direction === "down" ? -1 : 0;
    const dc = direction === "across" ? -1 : 0;
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nc >= 0 && grid[nr][nc] !== null) {
      setActiveCell({ row: nr, col: nc });
    }
  };

  const handleCheck = () => {
    const newStatus: ("correct" | "incorrect" | null)[][] = Array.from(
      { length: rows },
      () => Array(cols).fill(null)
    );
    let allCorrect = true;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === null) continue;
        if (userGrid[r][c] === grid[r][c]) {
          newStatus[r][c] = "correct";
        } else {
          newStatus[r][c] = "incorrect";
          allCorrect = false;
        }
      }
    }

    setCellStatus(newStatus);

    if (allCorrect) {
      setCelebration(true);
      setTimeout(() => setCelebration(false), 3000);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col] === null) return;

    if (activeCell && activeCell.row === row && activeCell.col === col) {
      setDirection((d) => (d === "across" ? "down" : "across"));
      const otherDir = direction === "across" ? "down" : "across";
      const wordIdx = findWordAtCell(row, col, otherDir);
      if (wordIdx !== null) setActiveWordIdx(wordIdx);
    } else {
      setActiveCell({ row, col });
      const wordIdx = findWordAtCell(row, col, direction);
      if (wordIdx !== null) {
        setActiveWordIdx(wordIdx);
      } else {
        const otherDir = direction === "across" ? "down" : "across";
        const otherIdx = findWordAtCell(row, col, otherDir);
        if (otherIdx !== null) {
          setActiveWordIdx(otherIdx);
          setDirection(otherDir);
        }
      }
    }
    setCellStatus(Array.from({ length: rows }, () => Array(cols).fill(null)));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeCell) return;
    const { row, col } = activeCell;

    if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚ]$/.test(e.key)) {
      e.preventDefault();
      const newGrid = userGrid.map((r) => [...r]);
      newGrid[row][col] = e.key.toUpperCase();
      setUserGrid(newGrid);
      moveToNext(row, col);
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      if (userGrid[row][col] !== "") {
        const newGrid = userGrid.map((r) => [...r]);
        newGrid[row][col] = "";
        setUserGrid(newGrid);
      } else {
        moveToPrev(row, col);
      }
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (col + 1 < cols && grid[row][col + 1] !== null) {
        setActiveCell({ row, col: col + 1 });
        setDirection("across");
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (col - 1 >= 0 && grid[row][col - 1] !== null) {
        setActiveCell({ row, col: col - 1 });
        setDirection("across");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (row + 1 < rows && grid[row + 1][col] !== null) {
        setActiveCell({ row: row + 1, col });
        setDirection("down");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (row - 1 >= 0 && grid[row - 1][col] !== null) {
        setActiveCell({ row: row - 1, col });
        setDirection("down");
      }
    }
  };

  const handleClueClick = (wordIdx: number) => {
    const word = words[wordIdx];
    setActiveWordIdx(wordIdx);
    setDirection(word.direction);
    setActiveCell({ row: word.startRow, col: word.startCol });
    setCellStatus(Array.from({ length: rows }, () => Array(cols).fill(null)));
  };

  const handleReset = () => {
    setUserGrid(grid.map((row) => row.map((cell) => (cell === null ? null : ""))));
    setActiveCell(null);
    setActiveWordIdx(null);
    setCellStatus(Array.from({ length: rows }, () => Array(cols).fill(null)));
    setCelebration(false);
    onAttemptIncrement?.();
  };

  const activeWordCells = new Set<string>();
  if (activeWordIdx !== null) {
    const word = words[activeWordIdx];
    for (const cell of getWordCells(word)) {
      activeWordCells.add(cellKey(cell.row, cell.col));
    }
  }

  const cellSize = Math.min(40, 360 / cols);

  return (
    <div className="space-y-6">
      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      {celebration && (
        <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-700">Crucigrama completado!</p>
          <p className="text-sm text-green-600">Todas las respuestas son correctas</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
        {attemptCount !== undefined && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Intento #{attemptCount}
          </span>
        )}
        <button
          onClick={handleCheck}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Comprobar
        </button>
        <button
          onClick={handleReset}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 overflow-x-auto relative">
          <div
            ref={gridRef}
            className="inline-grid select-none"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gap: 0,
            }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const key = cellKey(r, c);
                const isBlack = cell === null;
                const num = numbers.get(key);
                const isActive = activeCell?.row === r && activeCell?.col === c;
                const isInWord = activeWordCells.has(key);
                const status = cellStatus[r]?.[c];

                let bgColor = "white";
                if (isBlack) bgColor = "#374151";
                else if (isActive) bgColor = "#bfdbfe";
                else if (isInWord) bgColor = "#e0e7ff";
                else if (status === "correct") bgColor = "#bbf7d0";
                else if (status === "incorrect") bgColor = "#fecaca";

                return (
                  <div
                    key={key}
                    className="relative flex items-center justify-center"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: bgColor,
                      border: isBlack ? "1px solid #374151" : "1px solid #d1d5db",
                    }}
                    onClick={() => handleCellClick(r, c)}
                  >
                    {!isBlack && num !== undefined && (
                      <span
                        className="absolute top-0 left-0.5 leading-none font-bold text-gray-500"
                        style={{ fontSize: cellSize * 0.25 }}
                      >
                        {num}
                      </span>
                    )}
                    {!isBlack && (
                      <span
                        className="font-mono font-bold text-gray-800"
                        style={{ fontSize: cellSize * 0.5 }}
                      >
                        {userGrid[r][c]}
                      </span>
                    )}
                    {status === "incorrect" && !isBlack && (
                      <XCircle className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
                    )}
                    {status === "correct" && !isBlack && userGrid[r][c] && (
                      <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onInput={(e) => {
              const input = e.currentTarget;
              const val = input.value;
              if (!activeCell || !val) return;
              const char = val.at(-1)?.toUpperCase();
              if (char && /^[A-ZÑÁÉÍÓÚ]$/.test(char)) {
                const { row, col } = activeCell;
                const newGrid = userGrid.map((r) => [...r]);
                newGrid[row][col] = char;
                setUserGrid(newGrid);
                moveToNext(row, col);
              }
              input.value = "";
            }}
            onKeyDown={(e) => {
              if (!activeCell) return;
              const { row, col } = activeCell;
              if (e.key === "Backspace") {
                e.preventDefault();
                if (userGrid[row][col] !== "") {
                  const newGrid = userGrid.map((r) => [...r]);
                  newGrid[row][col] = "";
                  setUserGrid(newGrid);
                } else {
                  moveToPrev(row, col);
                }
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {across.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Horizontales</h3>
            <ul className="space-y-1.5">
              {across.map((word) => {
                const idx = words.indexOf(word);
                const isActive = activeWordIdx === idx;
                return (
                  <li
                    key={`${word.number}-across`}
                    onClick={() => handleClueClick(idx)}
                    className={`text-sm flex gap-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-semibold shrink-0">{word.number}.</span>
                    <span>{word.clue}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {down.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Verticales</h3>
            <ul className="space-y-1.5">
              {down.map((word) => {
                const idx = words.indexOf(word);
                const isActive = activeWordIdx === idx;
                return (
                  <li
                    key={`${word.number}-down`}
                    onClick={() => handleClueClick(idx)}
                    className={`text-sm flex gap-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-semibold shrink-0">{word.number}.</span>
                    <span>{word.clue}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
