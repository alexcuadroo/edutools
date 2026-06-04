import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "../types";
import type { SentenceOrderResult } from "./types";
import { shuffle } from "../../utils";

class SentenceOrderGenerator implements IPuzzleGenerator {
  id = "sentence-order" as const;
  name = "Ordenar Oracion";
  description = "Genera oraciones desordenadas para ordenar";

  generate(input: PuzzleInput): PuzzleResult & { grid: SentenceOrderResult } {
    const sentences = input.words
      .map((w) => w.word.trim())
      .filter((s) => s.length > 0 && s.split(/\s+/).length >= 3);

    if (sentences.length === 0) {
      throw new Error("Ingresa al menos una oracion valida (minimo 3 palabras).");
    }

    const result = sentences.map((sentence) => {
      const words = sentence.split(/\s+/);
      const shuffled = this.shuffleWords(words);
      return {
        original: sentence,
        shuffled,
      };
    });

    return {
      type: "sentence-order",
      grid: {
        sentences: result,
      },
      words: input.words,
    };
  }

  private shuffleWords(words: string[]): string[] {
    let shuffled = shuffle(words);
    let attempts = 0;

    while (shuffled.join(" ") === words.join(" ") && attempts < 10) {
      shuffled = shuffle(words);
      attempts++;
    }

    return shuffled;
  }
}

export const sentenceOrderGenerator = new SentenceOrderGenerator();
