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
import type { WSWordPlacement } from "@/lib/puzzles/word-search/types";
import type { CWWord } from "@/lib/puzzles/crossword/types";
import type { FillBlanksResult } from "@/lib/puzzles/fill-blanks/types";
import type { HangmanResult } from "@/lib/puzzles/hangman/types";
import type { AnagramResult } from "@/lib/puzzles/anagram/types";
import type { SentenceOrderResult } from "@/lib/puzzles/sentence-order/types";
import type { MCResult } from "@/lib/puzzles/match-columns/types";
import type { MemoryResult } from "@/lib/puzzles/memory/types";

describe("wsGridToPlayData", () => {
  it("convierte grid de sopa de letras a PlayData compacto", () => {
    const words: WSWordPlacement[] = [
      { word: "CASA", clue: "hogar", startRow: 0, startCol: 0, direction: "right" },
    ];
    const grid = { grid: [["C", "A", "S", "A"]], size: 4, words };

    const pd = wsGridToPlayData(grid, "Mi Sopa");

    expect(pd.g).toEqual([["C", "A", "S", "A"]]);
    expect(pd.s).toBe(4);
    expect(pd.t).toBe("Mi Sopa");
    expect(pd.w).toHaveLength(1);
    expect(pd.w[0]!.w).toBe("CASA");
    expect(pd.w[0]!.c).toBe("hogar");
  });

  it("roundtrip: wsGridToPlayData + playDataToWSWords preserva los datos", () => {
    const words: WSWordPlacement[] = [
      { word: "SOL", clue: "estrella", startRow: 1, startCol: 2, direction: "down" },
      { word: "LUNA", startRow: 0, startCol: 0, direction: "right" },
    ];
    const grid = { grid: [["L", "U", "N", "A"]], size: 4, words };

    const pd = wsGridToPlayData(grid);
    const decoded = playDataToWSWords(pd);

    expect(decoded).toHaveLength(2);
    expect(decoded[0]!.word).toBe("SOL");
    expect(decoded[0]!.clue).toBe("estrella");
    expect(decoded[0]!.direction).toBe("down");
    expect(decoded[1]!.word).toBe("LUNA");
  });
});

describe("cwGridToPlayData", () => {
  it("convierte grid de crucigrama a PlayData compacto", () => {
    const gridData = { grid: [["H", "O", "L", "A"]], rows: 1, cols: 4 };
    const words: CWWord[] = [
      { word: "HOLA", clue: "saludo", number: 1, direction: "across", startRow: 0, startCol: 0 },
    ];
    const numbers = new Map([["0,0", 1]]);

    const pd = cwGridToPlayData({ ...gridData, words, numbers }, "Cruci");

    expect(pd.g).toEqual([["H", "O", "L", "A"]]);
    expect(pd.r).toBe(1);
    expect(pd.c).toBe(4);
    expect(pd.t).toBe("Cruci");
    expect(pd.w).toHaveLength(1);
    expect(pd.n).toEqual({ "0,0": 1 });
  });

  it("roundtrip: cwGridToPlayData + playDataToCWWords", () => {
    const words: CWWord[] = [
      { word: "HOLA", clue: "saludo", number: 1, direction: "across", startRow: 0, startCol: 0 },
      { word: "OLA", clue: "onda", number: 2, direction: "down", startRow: 0, startCol: 1 },
    ];
    const numbers = new Map([["0,0", 1], ["0,1", 2]]);
    const gridData = { grid: [["H", "O", "L", "A"]], rows: 1, cols: 4, words, numbers };

    const pd = cwGridToPlayData(gridData);
    const decoded = playDataToCWWords(pd);
    const nums = playDataToCWNumbers(pd);

    expect(decoded).toHaveLength(2);
    expect(decoded[0]!.word).toBe("HOLA");
    expect(decoded[1]!.direction).toBe("down");
    expect(nums.get("0,0")).toBe(1);
  });
});

describe("fillBlanksResultToPlayData", () => {
  it("convierte resultado de rellenar huecos a PlayData", () => {
    const result: FillBlanksResult = {
      tokens: [
        { type: "word" as const, value: "El", index: 0 },
        { type: "space" as const, value: " ", index: 1 },
        { type: "word" as const, value: "gato", index: 2 },
      ],
      blanks: [{ word: "gato", tokenIndex: 2 }],
      options: ["gato", "perro", "raton"],
      originalText: "El gato",
    };

    const pd = fillBlanksResultToPlayData(result, "Huecos");

    expect(pd.t).toBe("Huecos");
    expect(pd.txt).toBe("El gato");
    expect(pd.b).toHaveLength(1);
    expect(pd.b[0]!.i).toBe(2);
    expect(pd.b[0]!.w).toBe("gato");
    expect(pd.o).toHaveLength(3);
  });
});

describe("hangmanResultToPlayData", () => {
  it("convierte resultado de ahorcado a PlayData", () => {
    const result: HangmanResult = {
      words: [
        { word: "CASA", clue: "hogar" },
        { word: "PERRO" },
      ],
      maxAttempts: 6,
    };

    const pd = hangmanResultToPlayData(result, "Ahorcado");

    expect(pd.t).toBe("Ahorcado");
    expect(pd.m).toBe(6);
    expect(pd.w).toHaveLength(2);
    expect(pd.w[0]!.w).toBe("CASA");
    expect(pd.w[0]!.c).toBe("hogar");
    expect(pd.w[1]!.c).toBeUndefined();
  });
});

describe("anagramResultToPlayData", () => {
  it("convierte resultado de anagrama a PlayData", () => {
    const result: AnagramResult = {
      words: [
        { word: "CASA", clue: "hogar", scrambled: "ASCA" },
        { word: "SOL", scrambled: "OLS" },
      ],
    };

    const pd = anagramResultToPlayData(result, "Anagramas");

    expect(pd.t).toBe("Anagramas");
    expect(pd.w).toHaveLength(2);
    expect(pd.w[0]!.w).toBe("CASA");
    expect(pd.w[0]!.s).toBe("ASCA");
    expect(pd.w[0]!.c).toBe("hogar");
  });
});

describe("sentenceOrderResultToPlayData", () => {
  it("convierte resultado de ordenar oración a PlayData", () => {
    const result: SentenceOrderResult = {
      sentences: [
        { original: "el gato come", shuffled: ["come", "el", "gato"] },
      ],
    };

    const pd = sentenceOrderResultToPlayData(result);

    expect(pd.s).toHaveLength(1);
    expect(pd.s[0]!.o).toBe("el gato come");
    expect(pd.s[0]!.w).toEqual(["come", "el", "gato"]);
    expect(pd.t).toBeUndefined();
  });
});

describe("matchColumnsResultToPlayData", () => {
  it("convierte resultado de relacionar columnas a PlayData", () => {
    const result: MCResult = {
      matches: [
        { word: "CASA", definition: "hogar" },
        { word: "PERRO", definition: "canino" },
      ],
      shuffledDefinitions: ["canino", "hogar"],
    };

    const pd = matchColumnsResultToPlayData(result, "Columnas");

    expect(pd.t).toBe("Columnas");
    expect(pd.m).toHaveLength(2);
    expect(pd.m[0]!.w).toBe("CASA");
    expect(pd.m[0]!.d).toBe("hogar");
    expect(pd.sd).toEqual(["canino", "hogar"]);
  });
});

describe("memoryResultToPlayData", () => {
  it("mapea pares de memoria a formato PlayData", () => {
    const result: MemoryResult = {
      cards: [
        { id: "card-0", pairId: 0, content: "CASA", type: "word" },
        { id: "card-1", pairId: 0, content: "hogar", type: "definition" },
      ],
      pairs: [{ word: "CASA", definition: "hogar" }],
      pairCount: 1,
    };

    const pd = memoryResultToPlayData(result);

    expect(pd.p).toEqual([{ w: "CASA", d: "hogar" }]);
    expect(pd.c).toHaveLength(2);
    expect(pd.c[0]!.p).toBe(0);
    expect(pd.c[0]!.ty).toBe("w");
    expect(pd.c[1]!.ty).toBe("d");
  });
});
