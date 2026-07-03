import { describe, it, expect } from "vitest";
import { memoryGenerator } from "@/lib/puzzles/memory/generator";
import type { PuzzleInput } from "@/lib/puzzles/types";
import type { MemoryResult } from "@/lib/puzzles/memory/types";

function makeInput(pairs: [string, string][]): PuzzleInput {
  return {
    words: pairs.map(([word, clue]) => ({ word, clue })),
  };
}

describe("memoryGenerator", () => {
  it("genera cartas emparejadas", () => {
    const result = memoryGenerator.generate(
      makeInput([
        ["CASA", "Lugar para vivir"],
        ["PERRO", "Mejor amigo"],
      ])
    );
    const grid = result.grid as MemoryResult;

    expect(grid.pairs).toHaveLength(2);
    expect(grid.pairCount).toBe(2);
    expect(grid.cards).toHaveLength(4);
  });

  it("cada par tiene una carta de palabra y una de definición", () => {
    const result = memoryGenerator.generate(
      makeInput([
        ["GATO", "Animal felino"],
        ["PEZ", "Animal acuático"],
        ["AVE", "Animal volador"],
      ])
    );
    const grid = result.grid as MemoryResult;

    const wordCards = grid.cards.filter((c) => c.type === "word");
    const defCards = grid.cards.filter((c) => c.type === "definition");

    expect(wordCards).toHaveLength(3);
    expect(defCards).toHaveLength(3);
  });

  it("cada carta tiene un id único", () => {
    const result = memoryGenerator.generate(
      makeInput([["HOLA", "saludo"], ["ADIOS", "despedida"]])
    );
    const grid = result.grid as MemoryResult;

    const ids = grid.cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("las cartas del mismo par comparten pairId", () => {
    const result = memoryGenerator.generate(
      makeInput([
        ["UNO", "numero uno"],
        ["DOS", "numero dos"],
      ])
    );
    const grid = result.grid as MemoryResult;

    const pair0 = grid.cards.filter((c) => c.pairId === 0);
    expect(pair0).toHaveLength(2);
    expect(pair0[0]!.type).not.toBe(pair0[1]!.type);
  });

  it("lanza error con menos de 2 pares", () => {
    expect(() =>
      memoryGenerator.generate(makeInput([["SOL", "estrella"]]))
    ).toThrow(/Necesitas al menos 2 pares/);
  });

  it("filtra pares sin definición", () => {
    const result = memoryGenerator.generate(
      makeInput([
        ["HOLA", "saludo"],
        ["MUNDO", ""],
        ["CASA", "hogar"],
      ])
    );
    const grid = result.grid as MemoryResult;

    expect(grid.pairs).toHaveLength(2);
  });

  it("el número de cartas es el doble del número de pares", () => {
    const result = memoryGenerator.generate(
      makeInput([
        ["AB", "primera"],
        ["BC", "segunda"],
        ["CD", "tercera"],
        ["DE", "cuarta"],
      ])
    );
    const grid = result.grid as MemoryResult;

    expect(grid.cards.length).toBe(grid.pairCount * 2);
  });
});
