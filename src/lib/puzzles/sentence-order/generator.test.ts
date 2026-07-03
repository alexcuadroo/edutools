import { describe, it, expect } from "vitest";
import { sentenceOrderGenerator } from "@/lib/puzzles/sentence-order/generator";
import type { PuzzleInput } from "@/lib/puzzles/types";
import type { SentenceOrderResult } from "@/lib/puzzles/sentence-order/types";

function makeInput(sentences: string[]): PuzzleInput {
  return {
    words: sentences.map((s) => ({ word: s })),
  };
}

describe("sentenceOrderGenerator", () => {
  it("genera oraciones desordenadas", () => {
    const result = sentenceOrderGenerator.generate(
      makeInput(["el gato come pescado", "la casa es grande"])
    );
    const grid = result.grid as SentenceOrderResult;

    expect(grid.sentences).toHaveLength(2);
    expect(grid.sentences[0]!.original).toBe("el gato come pescado");
    expect(grid.sentences[0]!.shuffled).toHaveLength(4);
  });

  it("cada oración desordenada tiene las mismas palabras", () => {
    const result = sentenceOrderGenerator.generate(
      makeInput(["los estudiantes aprenden matemáticas"])
    );
    const grid = result.grid as SentenceOrderResult;

    const originalWords = grid.sentences[0]!.original.split(/\s+/).sort();
    const shuffledWords = [...grid.sentences[0]!.shuffled].sort();
    expect(shuffledWords).toEqual(originalWords);
  });

  it("filtra oraciones con menos de 3 palabras", () => {
    const result = sentenceOrderGenerator.generate(
      makeInput(["hola mundo", "el perro ladra fuerte"])
    );
    const grid = result.grid as SentenceOrderResult;

    expect(grid.sentences).toHaveLength(1);
  });

  it("lanza error si no hay oraciones válidas", () => {
    expect(() =>
      sentenceOrderGenerator.generate(makeInput(["hola", "mundo"]))
    ).toThrow(/Ingresa al menos una oración/);
  });

  it("maneja oraciones largas", () => {
    const result = sentenceOrderGenerator.generate(
      makeInput(["el rápido zorro marrón salta sobre el perro perezoso"])
    );
    const grid = result.grid as SentenceOrderResult;

    expect(grid.sentences).toHaveLength(1);
    expect(grid.sentences[0]!.shuffled.length).toBeGreaterThanOrEqual(9);
  });
});
