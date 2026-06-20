import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "@/lib/puzzles/types";
import type { AnagramResult } from "@/lib/puzzles/anagram/types";
import { shuffle } from "@/lib/utils";

class AnagramGenerator implements IPuzzleGenerator {
  id = "anagram" as const;
  name = "Anagrama";
  description = "Genera anagramas con las palabras ingresadas";

  generate(input: PuzzleInput): PuzzleResult<AnagramResult> {
    const words = input.words
      .map((w) => ({
        word: w.word.toUpperCase().replace(/\s/g, ""),
        clue: w.clue || undefined,
      }))
      .filter((w) => w.word.length >= 3);

    if (words.length === 0) {
      throw new Error("Ingresa al menos una palabra valida (minimo 3 letras).");
    }

    const anagramWords = words.map((w) => ({
      ...w,
      scrambled: this.scrambleWord(w.word),
    }));

    return {
      type: "anagram",
      grid: {
        words: anagramWords,
      },
      words: input.words,
    };
  }

  private scrambleWord(word: string): string {
    const letters = word.split("");
    let scrambled = shuffle(letters).join("");

    let attempts = 0;
    while (scrambled === word && attempts < 10) {
      scrambled = shuffle(letters).join("");
      attempts++;
    }

    return scrambled;
  }
}

export const anagramGenerator = new AnagramGenerator();
