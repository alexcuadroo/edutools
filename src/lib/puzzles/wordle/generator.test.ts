import { describe, expect, it } from "vitest";
import { validateWordleInput } from "@/lib/puzzles/wordle/generator";

describe("wordle", () => {
  it("normaliza acentos y conserva una palabra válida de cinco letras", () => {
    expect(validateWordleInput({ word: " árbol ", clue: "Una planta" })).toEqual({ word: "ARBOL", clue: "Una planta" });
  });

  it("acepta palabras de 4 a 14 letras y rechaza las que quedan fuera del rango", () => {
    expect(validateWordleInput({ word: "luna" }).word).toBe("LUNA");
    expect(validateWordleInput({ word: "extraordinario" }).word).toBe("EXTRAORDINARIO");
    expect(() => validateWordleInput({ word: "sol" })).toThrow("entre 4 y 14 letras");
  });
});
