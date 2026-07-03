import { describe, it, expect } from "vitest";
import { matchColumnsGenerator } from "@/lib/puzzles/match-columns/generator";
import type { PuzzleInput } from "@/lib/puzzles/types";
import type { MCResult } from "@/lib/puzzles/match-columns/types";

function makeInput(pairs: [string, string][]): PuzzleInput {
  return {
    words: pairs.map(([word, clue]) => ({ word, clue })),
  };
}

describe("matchColumnsGenerator", () => {
  it("genera pares y definiciones mezcladas", () => {
    const result = matchColumnsGenerator.generate(
      makeInput([
        ["CASA", "Lugar para vivir"],
        ["PERRO", "Mejor amigo del hombre"],
        ["SOL", "Estrella del sistema solar"],
      ])
    );
    const grid = result.grid as MCResult;

    expect(grid.matches).toHaveLength(3);
    expect(grid.shuffledDefinitions).toHaveLength(3);
  });

  it("las definiciones mezcladas contienen las mismas definiciones", () => {
    const result = matchColumnsGenerator.generate(
      makeInput([
        ["GATO", "Animal felino"],
        ["PEZ", "Animal acuático"],
      ])
    );
    const grid = result.grid as MCResult;

    const originalDefs = grid.matches.map((m) => m.definition).sort();
    const shuffledDefs = [...grid.shuffledDefinitions].sort();
    expect(shuffledDefs).toEqual(originalDefs);
  });

  it("convierte palabras a mayúsculas", () => {
    const result = matchColumnsGenerator.generate(
      makeInput([
        ["hola", "saludo"],
        ["mundo", "planeta"],
      ])
    );
    const grid = result.grid as MCResult;

    expect(grid.matches[0]!.word).toBe("HOLA");
  });

  it("filtra pares sin definición", () => {
    const result = matchColumnsGenerator.generate(
      makeInput([
        ["HOLA", "saludo"],
        ["MUNDO", ""],
        ["CASA", "hogar"],
      ])
    );
    const grid = result.grid as MCResult;

    expect(grid.matches).toHaveLength(2);
  });

  it("lanza error con menos de 2 pares válidos", () => {
    expect(() =>
      matchColumnsGenerator.generate(makeInput([["SOL", "estrella"]]))
    ).toThrow(/Necesitas al menos 2 pares/);
  });

  it("filtra palabras de una sola letra", () => {
    const result = matchColumnsGenerator.generate(
      makeInput([
        ["A", "letra"],
        ["B", "otra letra"],
        ["CASA", "hogar"],
        ["PERRO", "canino"],
      ])
    );
    const grid = result.grid as MCResult;

    expect(grid.matches).toHaveLength(2);
    expect(grid.matches.every((m) => m.word.length >= 2)).toBe(true);
  });
});
