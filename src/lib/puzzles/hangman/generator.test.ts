import { describe, it, expect } from "vitest";
import { hangmanGenerator } from "@/lib/puzzles/hangman/generator";
import type { PuzzleInput } from "@/lib/puzzles/types";
import type { HangmanResult } from "@/lib/puzzles/hangman/types";

function makeInput(words: string[], clues?: string[]): PuzzleInput {
  return {
    words: words.map((w, i) => ({ word: w, clue: clues?.[i] })),
  };
}

describe("hangmanGenerator", () => {
  it("genera palabras con maxAttempts", () => {
    const result = hangmanGenerator.generate(makeInput(["casa", "perro", "sol"]));
    const grid = result.grid as HangmanResult;

    expect(grid.maxAttempts).toBe(6);
    expect(grid.words).toHaveLength(3);
    expect(grid.words[0]!.word).toBe("CASA");
  });

  it("convierte palabras a mayúsculas", () => {
    const result = hangmanGenerator.generate(makeInput(["Hola", "mundo"]));
    const grid = result.grid as HangmanResult;

    expect(grid.words[0]!.word).toBe("HOLA");
    expect(grid.words[1]!.word).toBe("MUNDO");
  });

  it("filtra palabras con menos de 2 caracteres", () => {
    const result = hangmanGenerator.generate(makeInput(["a", "sol", "b", "luna"]));
    const grid = result.grid as HangmanResult;

    expect(grid.words).toHaveLength(2);
    expect(grid.words[0]!.word).toBe("SOL");
  });

  it("lanza error si no hay palabras válidas", () => {
    expect(() => hangmanGenerator.generate(makeInput(["a", "b", "c"]))).toThrow(
      /Ingresa al menos una palabra/
    );
  });

  it("preserva pistas opcionales", () => {
    const result = hangmanGenerator.generate(
      makeInput(["gato", "perro"], ["animal felino", "mejor amigo"])
    );
    const grid = result.grid as HangmanResult;

    expect(grid.words[0]!.clue).toBe("animal felino");
    expect(grid.words[1]!.clue).toBe("mejor amigo");
  });

  it("elimina espacios de palabras compuestas", () => {
    const result = hangmanGenerator.generate(makeInput(["hola mundo"]));
    const grid = result.grid as HangmanResult;

    expect(grid.words[0]!.word).toBe("HOLAMUNDO");
  });
});
