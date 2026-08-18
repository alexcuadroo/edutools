import type { IPuzzleGenerator, PuzzleInput, PuzzleResult } from "@/lib/puzzles/types";
import type { WordleEntry, WordlePuzzleInput, WordleResult } from "@/lib/puzzles/wordle/types";

export function normalizeWordleWord(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export function validateWordleInput(input: WordlePuzzleInput): WordleEntry {
  const word = normalizeWordleWord(input.word);
  if (!/^[A-ZÑ]{4,14}$/.test(word)) throw new Error("La palabra debe tener entre 4 y 14 letras, sin espacios ni números.");
  return { word, clue: input.clue?.trim() || undefined };
}

class WordleGenerator implements IPuzzleGenerator<WordleResult> {
  id = "wordle" as const;
  name = "Cadenas de Palabras";
  description = "Adiviná una palabra de 5 letras en 6 intentos";

  generate(input: PuzzleInput): PuzzleResult<WordleResult> {
    if (!input.words.length) throw new Error("Ingresá al menos una palabra para el juego.");
    const grid = { words: input.words.map((entry, index) => {
      try { return validateWordleInput(entry); } catch (error) { throw new Error(`Línea ${index + 1}: ${error instanceof Error ? error.message : "palabra inválida"}`, { cause: error }); }
    }) };
    return { type: "wordle", grid, words: grid.words };
  }
}

export const wordleGenerator = new WordleGenerator();
