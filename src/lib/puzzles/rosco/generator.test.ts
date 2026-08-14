import { describe, expect, it } from "vitest";
import { ROSCO_LETTERS, type RoscoEntry } from "@/lib/puzzles/rosco/types";
import { normalizeRoscoAnswer, validateRoscoInput } from "@/lib/puzzles/rosco/generator";
import { answerRoscoEntry, createRoscoGameState, isRoscoComplete, passRoscoEntry } from "@/lib/puzzles/rosco/game";

const entries: RoscoEntry[] = ROSCO_LETTERS.map((letter) => ({ letter, answer: `${letter}respuesta`, clue: `Pista ${letter}`, rule: "starts-with" }));

describe("rosco", () => {
  it("valida las 26 entradas y un tiempo válido", () => {
    expect(validateRoscoInput({ entries, durationSeconds: 180 }).entries).toHaveLength(26);
    expect(() => validateRoscoInput({ entries: entries.slice(0, -1), durationSeconds: 180 })).toThrow(/26 entradas/);
  });

  it("comprueba la regla empieza con o contiene", () => {
    const invalid = entries.map((entry) => ({ ...entry }));
    invalid[0] = { ...invalid[0]!, answer: "casa" };
    expect(() => validateRoscoInput({ entries: invalid, durationSeconds: 180 })).toThrow(/empiece con/);
    const contains = entries.map((entry) => ({ ...entry }));
    contains[23] = { letter: "X", answer: "texto", clue: "Tiene X", rule: "contains" };
    expect(validateRoscoInput({ entries: contains, durationSeconds: 180 }).entries[23]!.rule).toBe("contains");
  });

  it("normaliza tildes, mayúsculas, espacios y signos", () => {
    expect(normalizeRoscoAnswer(" Árbol, azul! ")).toBe("ARBOLAZUL");
  });

  it("pasa, responde y finaliza cuando no quedan entradas", () => {
    const shortEntries = entries.slice(0, 2);
    const initial = createRoscoGameState(shortEntries);
    const passed = passRoscoEntry(initial);
    expect(passed.currentIndex).toBe(1);
    const correct = answerRoscoEntry(passed, shortEntries[1]!, "Brespuesta");
    expect(correct.currentIndex).toBe(0);
    const finished = answerRoscoEntry(correct, shortEntries[0]!, "incorrecta");
    expect(isRoscoComplete(finished)).toBe(true);
    expect(finished.statuses).toEqual(["incorrect", "correct"]);
  });
});
