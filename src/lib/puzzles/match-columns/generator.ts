import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "@/lib/puzzles/types";
import type { MCResult } from "@/lib/puzzles/match-columns/types";
import { shuffle } from "@/lib/utils";

class MatchColumnsGenerator implements IPuzzleGenerator {
  id = "match-columns" as const;
  name = "Relacionar Columnas";
  description = "Genera un juego de relacionar palabras con sus definiciones";

  generate(input: PuzzleInput): PuzzleResult<MCResult> {
    const pairs = input.words
      .map((w) => ({
        word: w.word.toUpperCase().replace(/\s/g, ""),
        definition: w.clue ?? "",
      }))
      .filter((p) => p.word.length >= 2 && p.definition.length > 0);

    if (pairs.length < 2) {
      throw new Error(
        "Necesitas al menos 2 pares de palabra-definición. Asegurate de que cada línea tenga el formato: PALABRA - definición"
      );
    }

    const shuffled = shuffle(pairs.map((p) => p.definition));

    return {
      type: "match-columns",
      grid: {
        matches: pairs,
        shuffledDefinitions: shuffled,
      },
      words: input.words,
    };
  }
}

export const matchColumnsGenerator = new MatchColumnsGenerator();
