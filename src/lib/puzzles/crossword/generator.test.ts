import { describe, it, expect } from "vitest";
import { crosswordGenerator } from "@/lib/puzzles/crossword/generator";
import type { PuzzleInput } from "@/lib/puzzles/types";
import type { CWGrid } from "@/lib/puzzles/crossword/types";

function makeInput(words: string[], clues?: string[]): PuzzleInput {
  return {
    words: words.map((w, i) => ({ word: w, clue: clues?.[i] ?? `Pista para ${w}` })),
  };
}

describe("crosswordGenerator", () => {
  it("genera un crucigrama con palabras que se intersectan", () => {
    const result = crosswordGenerator.generate(
      makeInput(["casa", "mesa", "sala", "pala"])
    );

    expect(result.type).toBe("crossword");
    const grid = result.grid as CWGrid;
    expect(grid.words.length).toBeGreaterThanOrEqual(1);
    expect(grid.grid.length).toBeGreaterThan(0);
    expect(grid.grid[0]!.length).toBeGreaterThan(0);
    expect(grid.rows).toBeGreaterThan(0);
  });

  it("coloca al menos una palabra horizontal como primera", () => {
    const result = crosswordGenerator.generate(makeInput(["sol", "luna"]));
    const grid = result.grid as CWGrid;

    expect(grid.words.length).toBeGreaterThanOrEqual(1);
    expect(grid.words[0]!.direction).toBe("across");
  });

  it("asigna números a las palabras", () => {
    const result = crosswordGenerator.generate(
      makeInput(["perro", "gato", "pato"])
    );
    const grid = result.grid as CWGrid;

    for (const word of grid.words) {
      expect(word.number).toBeGreaterThan(0);
      expect(typeof word.number).toBe("number");
    }
  });

  it("todas las palabras colocadas tienen clue", () => {
    const words = ["hola", "mundo", "casa"];
    const clues = ["saludo", "planeta", "hogar"];
    const result = crosswordGenerator.generate(makeInput(words, clues));
    const grid = result.grid as CWGrid;

    for (const word of grid.words) {
      expect(word.clue).toBeTruthy();
    }
  });

  it("retorna words en el resultado con pistas", () => {
    const result = crosswordGenerator.generate(makeInput(["cama", "mesa"]));
    expect(result.words).toHaveLength(2);
    expect(result.words[0]!.clue).toBe("Pista para cama");
  });

  it("lanza error cuando no se pueden intersectar palabras sin intersecciones", () => {
    expect(() =>
      crosswordGenerator.generate(makeInput(["XYZQWERTY", "ASDFGHJKL"]))
    ).toThrow();
  });
});
