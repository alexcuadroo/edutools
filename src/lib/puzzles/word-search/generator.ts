import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "../types";
import { type WSDirection, type WSGrid, type WSWordPlacement, WS_DIRECTIONS } from "./types";
import { shuffle } from "../../utils";

class WordSearchGenerator implements IPuzzleGenerator {
  id = "word-search" as const;
  name = "Sopa de Letras";
  description = "Genera una sopa de letras con las palabras ingresadas";

  generate(input: PuzzleInput): PuzzleResult & { grid: WSGrid } {
    const words = input.words.map((w) => w.word.toUpperCase().replace(/\s/g, ""));
    const clues = input.words.map((w) => w.clue);
    const size = input.size ?? 15;
    const maxAttempts = 100;

    let placements: WSWordPlacement[] = [];
    let grid: string[][] | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      grid = Array.from({ length: size }, () => Array(size).fill(""));
      placements = [];
      const sorted = [...words].sort((a, b) => b.length - a.length);

      let allPlaced = true;
      for (const word of sorted) {
        const placement = tryPlaceWord(grid, word, size);
        if (placement) {
          placements.push(placement);
        } else {
          allPlaced = false;
          break;
        }
      }

      if (allPlaced) break;
    }

    if (!grid || placements.length < words.length) {
      throw new Error(
        "No se pudieron colocar todas las palabras. Intenta con menos palabras o palabras más cortas."
      );
    }

    fillEmptyCells(grid, size);

    return {
      type: "word-search",
      grid: {
        grid,
        size,
        words: placements.map((p, i) => ({ ...p, clue: clues[i] })),
      },
      words: input.words,
    };
  }
}

function tryPlaceWord(
  grid: string[][],
  word: string,
  size: number
): WSWordPlacement | null {
  const directions = shuffle(Object.entries(WS_DIRECTIONS) as [WSDirection, [number, number]][]);
  const startPositions: [number, number][] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      startPositions.push([r, c]);
    }
  }
  const shuffled = shuffle(startPositions);

  for (const [startRow, startCol] of shuffled) {
    for (const [direction, [dr, dc]] of directions) {
      const endRow = startRow + dr * (word.length - 1);
      const endCol = startCol + dc * (word.length - 1);

      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = startRow + dr * i;
          const c = startCol + dc * i;
          grid[r][c] = word[i];
        }
        return { word, startRow, startCol, direction };
      }
    }
  }

  return null;
}

function fillEmptyCells(grid: string[][], size: number) {
  const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

export const wordSearchGenerator = new WordSearchGenerator();
