import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "../types";
import type { HangmanResult } from "./types";

class HangmanGenerator implements IPuzzleGenerator {
  id = "hangman" as const;
  name = "Ahorcado";
  description = "Genera un juego de ahorcado con las palabras ingresadas";

  generate(input: PuzzleInput): PuzzleResult<HangmanResult> {
    const words = input.words
      .map((w) => ({
        word: w.word.toUpperCase().replace(/\s/g, ""),
        clue: w.clue || undefined,
      }))
      .filter((w) => w.word.length >= 2);

    if (words.length === 0) {
      throw new Error("Ingresa al menos una palabra valida (minimo 2 letras).");
    }

    return {
      type: "hangman",
      grid: {
        words,
        maxAttempts: 6,
      },
      words: input.words,
    };
  }
}

export const hangmanGenerator = new HangmanGenerator();
