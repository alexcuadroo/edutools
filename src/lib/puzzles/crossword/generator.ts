import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "../types";
import type { CWGrid, CWWord } from "./types";
import { shuffle } from "../../utils";

class CrosswordGenerator implements IPuzzleGenerator {
  id = "crossword" as const;
  name = "Crucigrama";
  description = "Genera un crucigrama con las palabras y pistas ingresadas";

  generate(input: PuzzleInput): PuzzleResult & { grid: CWGrid } {
    const items = input.words.map((w) => ({
      word: w.word.toUpperCase().replace(/\s/g, ""),
      clue: w.clue ?? "",
    }));

    items.sort((a, b) => b.word.length - a.word.length);

    const size = 20;
    const grid: (string | null)[][] = Array.from({ length: size }, () =>
      Array(size).fill(null)
    );
    const placed: CWWord[] = [];
    let nextNumber = 1;
    const cellNumbers = new Map<string, number>();

    const first = items[0];
    const midRow = Math.floor(size / 2);
    const startCol = Math.floor((size - first.word.length) / 2);

    for (let i = 0; i < first.word.length; i++) {
      grid[midRow][startCol + i] = first.word[i];
    }
    cellNumbers.set(`${midRow},${startCol}`, nextNumber);
    placed.push({
      word: first.word,
      clue: first.clue,
      number: nextNumber,
      direction: "across",
      startRow: midRow,
      startCol,
    });
    nextNumber++;

    const remaining = items.slice(1);

    for (let attempt = 0; attempt < 50; attempt++) {
      const result = this.tryPlaceAll(
        grid,
        size,
        placed,
        cellNumbers,
        nextNumber,
        attempt === 0 ? remaining : shuffle(remaining)
      );
      if (result) {
        return {
          type: "crossword",
          grid: this.normalize(result.grid, result.placed, result.numbers),
          words: result.placed.map((p) => ({ word: p.word, clue: p.clue })),
        };
      }
    }

    throw new Error(
      "No se pudo generar el crucigrama. Intenta con menos palabras o palabras más cortas."
    );
  }

  private tryPlaceAll(
    grid: (string | null)[][],
    size: number,
    placed: CWWord[],
    cellNumbers: Map<string, number>,
    nextNumber: number,
    remaining: { word: string; clue: string }[]
  ): { grid: (string | null)[][]; placed: CWWord[]; numbers: Map<string, number> } | null {
    if (remaining.length === 0) {
      return { grid, placed, numbers: new Map(cellNumbers) };
    }

    const item = remaining[0];
    const rest = remaining.slice(1);
    const candidates = this.findIntersections(grid, size, item.word, placed);

    for (const cand of shuffle(candidates)) {
      const newGrid = grid.map((row) => [...row]);
      const newPlaced = [...placed];
      const newNumbers = new Map(cellNumbers);

      for (let i = 0; i < item.word.length; i++) {
        const r = cand.direction === "across" ? cand.row : cand.row + i;
        const c = cand.direction === "across" ? cand.col + i : cand.col;
        newGrid[r][c] = item.word[i];
      }

      const key = `${cand.row},${cand.col}`;
      const isNewCell = !newNumbers.has(key);
      const wordNumber = isNewCell ? nextNumber : newNumbers.get(key)!;
      if (isNewCell) {
        newNumbers.set(key, nextNumber);
      }
      const nextNum = isNewCell ? nextNumber + 1 : nextNumber;

      newPlaced.push({
        word: item.word,
        clue: item.clue,
        number: wordNumber,
        direction: cand.direction,
        startRow: cand.row,
        startCol: cand.col,
      });

      const result = this.tryPlaceAll(newGrid, size, newPlaced, newNumbers, nextNum, rest);
      if (result) return result;
    }

    return null;
  }

  private findIntersections(
    grid: (string | null)[][],
    size: number,
    word: string,
    placed: CWWord[]
  ): { row: number; col: number; direction: "across" | "down" }[] {
    const results: { row: number; col: number; direction: "across" | "down" }[] = [];
    const occupied = new Set<string>();

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== null) occupied.add(`${r},${c}`);
      }
    }

    for (let i = 0; i < word.length; i++) {
      const letter = word[i];

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] !== letter) continue;

          const wouldCross = placed.some((p) => {
            for (let j = 0; j < p.word.length; j++) {
              const pr = p.direction === "across" ? p.startRow : p.startRow + j;
              const pc = p.direction === "across" ? p.startCol + j : p.startCol;
              if (pr === r && pc === c) return true;
            }
            return false;
          });
          if (!wouldCross) continue;

          this.tryDirection(results, occupied, word, i, r, c, "across", size);
          this.tryDirection(results, occupied, word, i, r, c, "down", size);
        }
      }
    }

    return results;
  }

  private tryDirection(
    results: { row: number; col: number; direction: "across" | "down" }[],
    occupied: Set<string>,
    word: string,
    letterIndex: number,
    r: number,
    c: number,
    direction: "across" | "down",
    size: number
  ) {
    const startRow = direction === "across" ? r : r - letterIndex;
    const startCol = direction === "across" ? c - letterIndex : c;

    if (startRow < 0 || startCol < 0) return;
    const endRow = startRow + (direction === "down" ? word.length - 1 : 0);
    const endCol = startCol + (direction === "across" ? word.length - 1 : 0);
    if (endRow >= size || endCol >= size) return;

    for (let i = 0; i < word.length; i++) {
      const cr = startRow + (direction === "down" ? i : 0);
      const cc = startCol + (direction === "across" ? i : 0);

      if (cr === r && cc === c) continue;
      if (occupied.has(`${cr},${cc}`)) return;
    }

    results.push({ row: startRow, col: startCol, direction });
  }

  private normalize(
    grid: (string | null)[][],
    placed: CWWord[],
    numbers: Map<string, number>
  ): CWGrid {
    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] !== null) {
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }
      }
    }

    const rows = maxRow - minRow + 1;
    const cols = maxCol - minCol + 1;
    const trimmed: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null)
    );
    const newNumbers = new Map<string, number>();

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (grid[r]?.[c] !== null && grid[r]?.[c] !== undefined) {
          trimmed[r - minRow][c - minCol] = grid[r][c];
        }
      }
    }

    for (const [key, num] of numbers) {
      const [r, c] = key.split(",").map(Number);
      newNumbers.set(`${r - minRow},${c - minCol}`, num);
    }

    const adjustedWords = placed.map((w) => ({
      ...w,
      startRow: w.startRow - minRow,
      startCol: w.startCol - minCol,
    }));

    return { grid: trimmed, rows, cols, words: adjustedWords, numbers: newNumbers };
  }
}

export const crosswordGenerator = new CrosswordGenerator();
