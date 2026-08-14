import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "@/lib/puzzles/types";
import { ROSCO_LETTERS, type RoscoPuzzleInput, type RoscoResult } from "@/lib/puzzles/rosco/types";

export function normalizeRoscoAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function validateRoscoInput(input: RoscoPuzzleInput): RoscoResult {
  if (!Number.isInteger(input.durationSeconds) || input.durationSeconds < 10 || input.durationSeconds > 60 * 60) {
    throw new Error("El tiempo debe estar entre 10 segundos y 60 minutos.");
  }
  if (input.entries.length !== ROSCO_LETTERS.length) {
    throw new Error("El rosco debe tener exactamente 26 entradas, de A a Z.");
  }

  const entries = input.entries.map((entry, index) => {
    const expectedLetter = ROSCO_LETTERS[index]!;
    const letter = entry.letter.trim().toUpperCase();
    const answer = entry.answer.trim();
    const clue = entry.clue.trim();
    if (letter !== expectedLetter) throw new Error(`La entrada ${index + 1} debe corresponder a la letra ${expectedLetter}.`);
    if (!answer) throw new Error(`Falta la respuesta para la letra ${letter}.`);
    if (!clue) throw new Error(`Falta la pista para la letra ${letter}.`);
    if (entry.rule !== "starts-with" && entry.rule !== "contains") throw new Error(`La regla de ${letter} no es válida.`);

    const normalized = normalizeRoscoAnswer(answer);
    const valid = entry.rule === "starts-with" ? normalized.startsWith(letter) : normalized.includes(letter);
    if (!valid) {
      const verb = entry.rule === "starts-with" ? "empiece con" : "contenga";
      throw new Error(`La respuesta de ${letter} debe ${verb} la letra ${letter}.`);
    }
    return { letter, answer, clue, rule: entry.rule };
  });

  return { entries, durationSeconds: input.durationSeconds };
}

class RoscoGenerator implements IPuzzleGenerator<RoscoResult> {
  id = "rosco" as const;
  name = "Rosco";
  description = "Genera un rosco digital de preguntas y respuestas";

  generate(input: PuzzleInput): PuzzleResult<RoscoResult> {
    if (!input.entries || input.durationSeconds === undefined) {
      throw new Error("Faltan las entradas o el tiempo del rosco.");
    }
    const grid = validateRoscoInput({ entries: input.entries, durationSeconds: input.durationSeconds });
    return { type: "rosco", grid, words: grid.entries.map((entry) => ({ word: entry.answer, clue: entry.clue })) };
  }
}

export const roscoGenerator = new RoscoGenerator();
