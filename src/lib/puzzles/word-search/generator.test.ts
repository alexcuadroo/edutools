import { describe, it, expect } from "vitest";
import { wordSearchGenerator } from "@/lib/puzzles/word-search/generator";
import type { PuzzleInput } from "@/lib/puzzles/types";
import type { WSGrid } from "@/lib/puzzles/word-search/types";

function makeInput(words: string[], clues?: string[]): PuzzleInput {
  return {
    words: words.map((w, i) => ({ word: w, clue: clues?.[i] })),
    size: 12,
  };
}

function findWordInGrid(grid: string[][], word: string): boolean {
  const size = grid.length;
  const upper = word.toUpperCase();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const [dr, dc] of [
        [0, 1], [1, 0], [1, 1], [-1, 1],
        [0, -1], [-1, 0], [1, -1], [-1, -1],
      ] as [number, number][]) {
        let found = true;
        for (let i = 0; i < upper.length; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size || grid[nr]![nc] !== upper[i]) {
            found = false;
            break;
          }
        }
        if (found) return true;
      }
    }
  }
  return false;
}

describe("wordSearchGenerator", () => {
  it("genera una sopa de letras con palabras válidas", () => {
    const result = wordSearchGenerator.generate(makeInput(["casa", "perro", "sol", "luna"]));

    expect(result.type).toBe("word-search");

    const grid = result.grid as WSGrid;
    expect(grid.size).toBe(12);
    expect(grid.grid).toHaveLength(12);
    expect(grid.grid[0]).toHaveLength(12);
    expect(grid.words).toHaveLength(4);

    for (const word of grid.words) {
      expect(findWordInGrid(grid.grid, word.word)).toBe(true);
    }
  });

  it("coloca todas las palabras en el grid", () => {
    const words = ["escuela", "biblioteca", "computadora", "matematica"];
    const result = wordSearchGenerator.generate(makeInput(words, ["c1", "c2", "c3", "c4"]));

    const grid = result.grid as WSGrid;
    for (const word of grid.words) {
      expect(findWordInGrid(grid.grid, word.word)).toBe(true);
      expect(word.clue).toBeDefined();
    }
  });

  it("el grid no tiene celdas vacías", () => {
    const result = wordSearchGenerator.generate(makeInput(["hola", "mundo"]));
    const grid = result.grid as WSGrid;

    for (const row of grid.grid) {
      for (const cell of row) {
        expect(cell).not.toBe("");
      }
    }
  });

  it("usa espacios para palabras sin espacios", () => {
    const result = wordSearchGenerator.generate(makeInput(["HOLA MUNDO"]));
    const grid = result.grid as WSGrid;

    expect(grid.words).toHaveLength(1);
    expect(grid.words[0]!.word).toBe("HOLAMUNDO");
    expect(findWordInGrid(grid.grid, "HOLAMUNDO")).toBe(true);
  });

  it("lanza error con demasiadas palabras largas para grid pequeño", () => {
    const longWords = Array.from({ length: 10 }, (_, i) =>
      "PALABRA" + i.toString().padStart(2, "0")
    );
    expect(() => wordSearchGenerator.generate({ words: longWords.map(w => ({ word: w })), size: 6 }))
      .toThrow(/No se pudieron colocar/);
  });
});
