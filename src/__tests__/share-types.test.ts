import { describe, it, expect } from "vitest";
import { memoryResultToPlayData } from "@/lib/share/types";

describe("memoryResultToPlayData", () => {
  it("maps memory pairs to the play-data shape used by the game", () => {
    const result = {
      cards: [],
      pairs: [{ word: "Hola", definition: "Greeting" }],
      pairCount: 1,
    };

    const playData = memoryResultToPlayData(result);

    expect(playData.p).toEqual([{ w: "Hola", d: "Greeting" }]);
  });
});
