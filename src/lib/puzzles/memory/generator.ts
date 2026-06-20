import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "@/lib/puzzles/types";
import type { MemoryCard, MemoryResult } from "@/lib/puzzles/memory/types";
import { shuffle } from "@/lib/utils";

class MemoryGenerator implements IPuzzleGenerator {
  id = "memory" as const;
  name = "Memoria";
  description = "Genera un juego de memoria con pares de palabras y definiciones";

  generate(input: PuzzleInput): PuzzleResult<MemoryResult> {
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

    const cards: MemoryCard[] = [];
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]!;
      cards.push({
        id: `card-${i * 2}`,
        pairId: i,
        content: pair.word,
        type: "word",
      });
      cards.push({
        id: `card-${i * 2 + 1}`,
        pairId: i,
        content: pair.definition,
        type: "definition",
      });
    }

    const shuffled = shuffle(cards);

    return {
      type: "memory",
      grid: {
        cards: shuffled,
        pairs,
        pairCount: pairs.length,
      },
      words: input.words,
    };
  }
}

export const memoryGenerator = new MemoryGenerator();
