import type { AllowedPuzzleType } from "@/lib/env";
import { wordSearchGenerator } from "@/lib/puzzles/word-search/generator";
import { crosswordGenerator } from "@/lib/puzzles/crossword/generator";
import { fillBlanksGenerator } from "@/lib/puzzles/fill-blanks/generator";
import { hangmanGenerator } from "@/lib/puzzles/hangman/generator";
import { anagramGenerator } from "@/lib/puzzles/anagram/generator";
import { sentenceOrderGenerator } from "@/lib/puzzles/sentence-order/generator";
import { matchColumnsGenerator } from "@/lib/puzzles/match-columns/generator";
import { memoryGenerator } from "@/lib/puzzles/memory/generator";
import { roscoGenerator } from "@/lib/puzzles/rosco/generator";
import { wordleGenerator } from "@/lib/puzzles/wordle/generator";
import type { RoscoRule } from "@/lib/puzzles/rosco/types";
import {
  anagramResultToPlayData,
  cwGridToPlayData,
  fillBlanksResultToPlayData,
  hangmanResultToPlayData,
  matchColumnsResultToPlayData,
  memoryResultToPlayData,
  roscoResultToPlayData,
  sentenceOrderResultToPlayData,
  wordleResultToPlayData,
  wsGridToPlayData,
} from "@/lib/share/types";

type WordClue = { word: string; clue?: string };

export function generatePlayablePuzzle(
  type: AllowedPuzzleType,
  title: string,
  input: unknown,
): Record<string, unknown> {
  if (!isRecord(input)) throw new Error("'input' debe ser un objeto.");

  switch (type) {
    case "word-search": {
      const words = parseWords(input.words);
      const size = input.size === undefined ? 15 : parseInteger(input.size, "size", 5, 30);
      const result = wordSearchGenerator.generate({ words, size });
      return wsGridToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "crossword": {
      const result = crosswordGenerator.generate({ words: parseWords(input.words) });
      return cwGridToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "fill-blanks": {
      if (typeof input.text !== "string") throw new Error("'input.text' debe ser un texto.");
      if (input.text.length > 10_000) throw new Error("El texto no puede superar los 10.000 caracteres.");
      const blankCount = parseInteger(input.blankCount, "blankCount", 1, 100);
      const result = fillBlanksGenerator.generateFromText({ text: input.text, blankCount });
      return fillBlanksResultToPlayData(result, title) as unknown as Record<string, unknown>;
    }
    case "hangman": {
      const result = hangmanGenerator.generate({ words: parseWords(input.words) });
      return hangmanResultToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "anagram": {
      const result = anagramGenerator.generate({ words: parseWords(input.words) });
      return anagramResultToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "sentence-order": {
      const result = sentenceOrderGenerator.generate({ words: parseWords(input.words) });
      return sentenceOrderResultToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "match-columns": {
      const result = matchColumnsGenerator.generate({ words: parseWords(input.words) });
      return matchColumnsResultToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "memory": {
      const result = memoryGenerator.generate({ words: parseWords(input.words) });
      return memoryResultToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "rosco": {
      const entries = parseRoscoEntries(input.entries);
      const durationSeconds = parseInteger(input.durationSeconds, "durationSeconds", 10, 3600);
      const result = roscoGenerator.generate({
        words: [],
        entries,
        durationSeconds,
      });
      return roscoResultToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
    case "wordle": {
      const result = wordleGenerator.generate({ words: parseWords(input.words) });
      return wordleResultToPlayData(result.grid, title) as unknown as Record<string, unknown>;
    }
  }
}

function parseWords(value: unknown): WordClue[] {
  const entries: unknown[] = typeof value === "string"
    ? value.split(/\r?\n/).map((line) => {
      const trimmed = line.trim();
      const separator = trimmed.indexOf(" - ");
      return separator < 0
        ? { word: trimmed }
        : { word: trimmed.slice(0, separator).trim(), clue: trimmed.slice(separator + 3).trim() };
    }).filter((item) => isRecord(item) && item.word !== "")
    : Array.isArray(value)
      ? value
      : [];

  if (entries.length === 0 || entries.length > 100) {
    throw new Error("'input.words' debe ser una lista de entre 1 y 100 palabras u oraciones.");
  }

  return entries.map((item, index) => {
    if (!isRecord(item) || typeof item.word !== "string" || !item.word.trim()) {
      throw new Error(`La entrada ${index + 1} debe incluir una palabra u oración no vacía.`);
    }
    if (item.word.length > 200) throw new Error(`La entrada ${index + 1} supera los 200 caracteres.`);
    if (item.clue !== undefined && typeof item.clue !== "string") {
      throw new Error(`La pista de la entrada ${index + 1} debe ser texto.`);
    }
    return {
      word: item.word.trim(),
      clue: typeof item.clue === "string" && item.clue.trim() ? item.clue.trim() : undefined,
    };
  });
}

function parseRoscoEntries(value: unknown) {
  if (!Array.isArray(value) || value.length !== 26) {
    throw new Error("'input.entries' debe incluir las 26 letras del rosco, de A a Z.");
  }
  return value.map((item, index) => {
    if (!isRecord(item)
      || typeof item.letter !== "string"
      || typeof item.answer !== "string"
      || typeof item.clue !== "string"
      || (item.rule !== "starts-with" && item.rule !== "contains")) {
      throw new Error(`La entrada ${index + 1} debe tener letter, answer, clue y rule válidos.`);
    }
    return {
      letter: item.letter,
      answer: item.answer,
      clue: item.clue,
      rule: item.rule as RoscoRule,
    };
  });
}

function parseInteger(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`'input.${label}' debe ser un entero entre ${min} y ${max}.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
