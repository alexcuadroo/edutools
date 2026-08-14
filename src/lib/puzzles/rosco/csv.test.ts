import { describe, expect, it } from "vitest";
import { parseRoscoCsv } from "@/lib/puzzles/rosco/csv";
import { ROSCO_LETTERS } from "@/lib/puzzles/rosco/types";

const validCsv = [
  "letra,respuesta,regla,pista",
  ...ROSCO_LETTERS.map((letter) => `${letter},${letter}respuesta,empieza con,"Pista, ${letter}"`),
].join("\n");

describe("parseRoscoCsv", () => {
  it("importa 26 entradas y conserva las comas entre comillas", () => {
    const entries = parseRoscoCsv(validCsv);
    expect(entries).toHaveLength(26);
    expect(entries[0]).toMatchObject({ letter: "A", answer: "Arespuesta", clue: "Pista, A" });
  });

  it("acepta punto y coma y reglas en español", () => {
    const csv = validCsv.replaceAll(",", ";");
    expect(parseRoscoCsv(csv)[0]!.rule).toBe("starts-with");
  });

  it("rechaza encabezados y cantidades inválidas", () => {
    expect(() => parseRoscoCsv("A,respuesta,empieza con,pista")).toThrow(/comenzar/);
    expect(() => parseRoscoCsv(validCsv.split("\n").slice(0, -1).join("\n"))).toThrow(/26 filas/);
  });
});
