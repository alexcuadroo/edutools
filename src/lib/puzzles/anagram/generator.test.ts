import { describe, it, expect } from "vitest";
import { anagramGenerator } from "@/lib/puzzles/anagram/generator";
import type { PuzzleInput } from "@/lib/puzzles/types";
import type { AnagramResult } from "@/lib/puzzles/anagram/types";

function makeInput(words: string[], clues?: string[]): PuzzleInput {
  return {
    words: words.map((w, i) => ({ word: w, clue: clues?.[i] })),
  };
}

function sameLetters(a: string, b: string): boolean {
  return [...a].sort().join("") === [...b].sort().join("");
}

describe("anagramGenerator", () => {
  it("genera anagramas para palabras válidas", () => {
    const result = anagramGenerator.generate(makeInput(["casa", "perro", "sol"]));
    const grid = result.grid as AnagramResult;

    expect(grid.words).toHaveLength(3);
    expect(grid.words[0]!.word).toBe("CASA");
    expect(grid.words[0]!.scrambled).toBeDefined();
  });

  it("el anagrama tiene las mismas letras que la original", () => {
    const result = anagramGenerator.generate(makeInput(["murcielago"]));
    const grid = result.grid as AnagramResult;

    expect(sameLetters(grid.words[0]!.word, grid.words[0]!.scrambled)).toBe(true);
  });

  it("convierte palabras a mayúsculas", () => {
    const result = anagramGenerator.generate(makeInput(["Hola"]));
    const grid = result.grid as AnagramResult;

    expect(grid.words[0]!.word).toBe("HOLA");
  });

  it("filtra palabras con menos de 3 caracteres", () => {
    const result = anagramGenerator.generate(makeInput(["yo", "sol", "tu", "casa"]));
    const grid = result.grid as AnagramResult;

    expect(grid.words).toHaveLength(2);
    expect(grid.words[0]!.word).toBe("SOL");
    expect(grid.words[1]!.word).toBe("CASA");
  });

  it("lanza error si no hay palabras válidas", () => {
    expect(() => anagramGenerator.generate(makeInput(["a", "b"]))).toThrow(
      /Ingresa al menos una palabra/
    );
  });

  it("preserva pistas", () => {
    const result = anagramGenerator.generate(
      makeInput(["gato", "perro"], ["felino", "canino"])
    );
    const grid = result.grid as AnagramResult;

    expect(grid.words[0]!.clue).toBe("felino");
    expect(grid.words[1]!.clue).toBe("canino");
  });
});
