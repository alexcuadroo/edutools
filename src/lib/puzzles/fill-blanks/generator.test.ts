import { describe, it, expect } from "vitest";
import { fillBlanksGenerator } from "@/lib/puzzles/fill-blanks/generator";

describe("fillBlanksGenerator", () => {
  it("genera huecos y opciones desde texto válido", () => {
    const result = fillBlanksGenerator.generateFromText({
      text: "El gato negro saltó sobre la mesa de madera",
      blankCount: 3,
    });

    expect(result.blanks).toHaveLength(3);
    expect(result.options.length).toBeGreaterThanOrEqual(3);
  });

  it("las opciones incluyen las palabras correctas", () => {
    const result = fillBlanksGenerator.generateFromText({
      text: "El sol brilla en el cielo azul del día",
      blankCount: 4,
    });

    const correctWords = result.blanks.map((b) => b.word);
    for (const word of correctWords) {
      expect(result.options).toContain(word);
    }
  });

  it("preserva el texto original", () => {
    const text = "La escuela es grande y bonita";
    const result = fillBlanksGenerator.generateFromText({
      text,
      blankCount: 2,
    });

    expect(result.originalText).toBe(text);
  });

  it("cada blank tiene un índice de token válido", () => {
    const result = fillBlanksGenerator.generateFromText({
      text: "Los estudiantes aprenden matemáticas en la escuela",
      blankCount: 2,
    });

    for (const blank of result.blanks) {
      expect(typeof blank.tokenIndex).toBe("number");
      expect(result.tokens[blank.tokenIndex]).toBeDefined();
    }
  });

  it("lanza error si el texto es muy corto", () => {
    expect(() =>
      fillBlanksGenerator.generateFromText({
        text: "Hola",
        blankCount: 1,
      })
    ).toThrow(/al menos 10 caracteres/);
  });

  it("lanza error si no hay suficientes palabras para los huecos", () => {
    expect(() =>
      fillBlanksGenerator.generateFromText({
        text: "El gato come pescado",
        blankCount: 10,
      })
    ).toThrow(/no tiene suficientes palabras/);
  });

  it("genera distractorRatio correcto", () => {
    const result = fillBlanksGenerator.generateFromText({
      text: "Los niños juegan en el parque verde durante la tarde",
      blankCount: 3,
      distractorRatio: 0.5,
    });

    const correctWords = result.blanks.map((b) => b.word);
    const distractors = result.options.filter((o) => !correctWords.includes(o));
    expect(distractors.length).toBeGreaterThan(0);
  });
});
