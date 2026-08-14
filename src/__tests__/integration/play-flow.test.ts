import { describe, it, expect } from "vitest";
import {
  wsGridToPlayData,
  playDataToWSWords,
  cwGridToPlayData,
  playDataToCWWords,
  playDataToCWNumbers,
  fillBlanksResultToPlayData,
  hangmanResultToPlayData,
  anagramResultToPlayData,
  sentenceOrderResultToPlayData,
  matchColumnsResultToPlayData,
  memoryResultToPlayData,
} from "@/lib/share/types";
import { wordSearchGenerator } from "@/lib/puzzles/word-search/generator";
import { crosswordGenerator } from "@/lib/puzzles/crossword/generator";
import { fillBlanksGenerator } from "@/lib/puzzles/fill-blanks/generator";
import { hangmanGenerator } from "@/lib/puzzles/hangman/generator";
import { anagramGenerator } from "@/lib/puzzles/anagram/generator";
import { sentenceOrderGenerator } from "@/lib/puzzles/sentence-order/generator";
import { matchColumnsGenerator } from "@/lib/puzzles/match-columns/generator";
import { memoryGenerator } from "@/lib/puzzles/memory/generator";
import type { WSGrid } from "@/lib/puzzles/word-search/types";
import type { CWGrid } from "@/lib/puzzles/crossword/types";
import type { HangmanResult } from "@/lib/puzzles/hangman/types";
import type { AnagramResult } from "@/lib/puzzles/anagram/types";
import type { SentenceOrderResult } from "@/lib/puzzles/sentence-order/types";
import type { MCResult } from "@/lib/puzzles/match-columns/types";
import type { MemoryResult } from "@/lib/puzzles/memory/types";
import { roscoGenerator } from "@/lib/puzzles/rosco/generator";
import { ROSCO_LETTERS } from "@/lib/puzzles/rosco/types";
import { roscoResultToPlayData } from "@/lib/share/types";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8788";
const TEST_TITLE = "Integration Test";

async function createAndRetrieve(type: string, puzzle: unknown, customId?: string): Promise<unknown> {
  const id = customId || `t${Date.now().toString(16).slice(-8)}`;
  const res = await fetch(`${BASE_URL}/api/puzzles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, puzzle, id }),
  });
  const { id: returnedId } = await res.json() as { id: string };

  const getRes = await fetch(`${BASE_URL}/api/puzzles/${returnedId}`);
  if (!getRes.ok) {
    throw new Error(`GET puzzle failed: ${getRes.status}`);
  }
  const body = await getRes.json();
  return body.puzzle;
}

describe("Flujo completo: generar -> serializar -> API -> deserializar", () => {
  it("word-search: roundtrip generar + PlayData + API", async () => {
    const result = wordSearchGenerator.generate({
      words: [
        { word: "casa" as string, clue: "hogar" },
        { word: "perro" as string, clue: "canino" },
        { word: "sol" as string, clue: "estrella" },
      ],
      size: 12,
    });

    const pd = wsGridToPlayData(result.grid as WSGrid, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("word-search", pd);
    const decoded = playDataToWSWords(retrievedPuzzle as Parameters<typeof playDataToWSWords>[0]);

    expect(decoded).toHaveLength(3);
    const decodedWords = decoded.map((d) => d.word).sort();
    expect(decodedWords).toContain("CASA");
    expect(decodedWords).toContain("PERRO");
    expect(decodedWords).toContain("SOL");
    expect(retrievedPuzzle).toHaveProperty("g");
    expect(retrievedPuzzle).toHaveProperty("s");
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
  });

  it("crossword: roundtrip generar + PlayData + API", async () => {
    const result = crosswordGenerator.generate({
      words: [
        { word: "casa", clue: "hogar" },
        { word: "mesa", clue: "mueble" },
      ],
    });

    const pd = cwGridToPlayData(result.grid as CWGrid, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("crossword", pd);
    const decoded = playDataToCWWords(retrievedPuzzle as Parameters<typeof playDataToCWWords>[0]);
    const nums = playDataToCWNumbers(retrievedPuzzle as Parameters<typeof playDataToCWNumbers>[0]);

    expect(decoded.length).toBeGreaterThanOrEqual(1);
    expect(nums.size).toBeGreaterThanOrEqual(1);
    expect(retrievedPuzzle).toHaveProperty("g");
    expect(retrievedPuzzle).toHaveProperty("r");
    expect(retrievedPuzzle).toHaveProperty("c");
  });

  it("fill-blanks: roundtrip generar + PlayData + API", async () => {
    const result = fillBlanksGenerator.generateFromText({
      text: "El gato negro saltó sobre la mesa de madera",
      blankCount: 3,
    });

    const pd = fillBlanksResultToPlayData(result, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("fill-blanks", pd);

    expect(retrievedPuzzle).toHaveProperty("txt");
    expect(retrievedPuzzle).toHaveProperty("b");
    expect(retrievedPuzzle).toHaveProperty("o");
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
    const rp = retrievedPuzzle as { b: { i: number; w: string }[] };
    expect(rp.b).toHaveLength(3);
  });

  it("hangman: roundtrip generar + PlayData + API", async () => {
    const result = hangmanGenerator.generate({
      words: [{ word: "elefante", clue: "animal grande" }],
    });

    const pd = hangmanResultToPlayData(result.grid as HangmanResult, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("hangman", pd);

    expect(retrievedPuzzle).toHaveProperty("w");
    expect(retrievedPuzzle).toHaveProperty("m", 6);
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
    const rp = retrievedPuzzle as { w: { w: string; c?: string }[] };
    expect(rp.w[0]!.w).toBe("ELEFANTE");
  });

  it("anagram: roundtrip generar + PlayData + API", async () => {
    const result = anagramGenerator.generate({
      words: [{ word: "murcielago", clue: "animal nocturno" }],
    });

    const pd = anagramResultToPlayData(result.grid as AnagramResult, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("anagram", pd);

    expect(retrievedPuzzle).toHaveProperty("w");
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
    const rp = retrievedPuzzle as { w: { w: string; s: string }[] };
    expect(rp.w[0]!.w).toBe("MURCIELAGO");
    expect(rp.w[0]!.s).toBeDefined();
    expect(rp.w[0]!.s).not.toBe(rp.w[0]!.w);
  });

  it("sentence-order: roundtrip generar + PlayData + API", async () => {
    const result = sentenceOrderGenerator.generate({
      words: [{ word: "el perro ladra fuerte" }],
    });

    const pd = sentenceOrderResultToPlayData(result.grid as SentenceOrderResult, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("sentence-order", pd);

    expect(retrievedPuzzle).toHaveProperty("s");
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
    const rp = retrievedPuzzle as { s: { o: string; w: string[] }[] };
    expect(rp.s[0]!.o).toBe("el perro ladra fuerte");
    expect(rp.s[0]!.w).toHaveLength(4);
  });

  it("match-columns: roundtrip generar + PlayData + API", async () => {
    const result = matchColumnsGenerator.generate({
      words: [
        { word: "casa", clue: "hogar" },
        { word: "perro", clue: "canino" },
      ],
    });

    const pd = matchColumnsResultToPlayData(result.grid as MCResult, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("match-columns", pd);

    expect(retrievedPuzzle).toHaveProperty("m");
    expect(retrievedPuzzle).toHaveProperty("sd");
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
    const rp = retrievedPuzzle as { m: { w: string; d: string }[]; sd: string[] };
    expect(rp.m).toHaveLength(2);
    expect(rp.sd).toHaveLength(2);
  });

  it("memory: roundtrip generar + PlayData + API", async () => {
    const result = memoryGenerator.generate({
      words: [
        { word: "casa", clue: "hogar" },
        { word: "perro", clue: "canino" },
      ],
    });

    const pd = memoryResultToPlayData(result.grid as MemoryResult, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("memory", pd);

    expect(retrievedPuzzle).toHaveProperty("c");
    expect(retrievedPuzzle).toHaveProperty("p");
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
    const rp = retrievedPuzzle as { c: { id: string; p: number; ct: string; ty: string }[]; p: { w: string; d: string }[] };
    expect(rp.c).toHaveLength(4);
    expect(rp.p).toHaveLength(2);
  });

  it("rosco: roundtrip generar + PlayData + API", async () => {
    const result = roscoGenerator.generate({
      words: [],
      durationSeconds: 180,
      entries: ROSCO_LETTERS.map((letter) => ({
        letter,
        answer: `${letter}respuesta`,
        clue: `Pista ${letter}`,
        rule: "starts-with" as const,
      })),
    });

    const pd = roscoResultToPlayData(result.grid, TEST_TITLE);
    const retrievedPuzzle = await createAndRetrieve("rosco", pd);
    expect(retrievedPuzzle).toHaveProperty("d", 180);
    expect(retrievedPuzzle).toHaveProperty("t", TEST_TITLE);
    const rp = retrievedPuzzle as { e: { l: string; a: string; c: string; r: string }[] };
    expect(rp.e).toHaveLength(26);
    expect(rp.e[0]).toMatchObject({ l: "A", a: "Arespuesta", r: "starts-with" });
  });
});
