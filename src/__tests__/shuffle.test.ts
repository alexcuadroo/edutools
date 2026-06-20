import { describe, it, expect } from "vitest";
import { shuffle } from "../lib/utils/shuffle";

describe("shuffle", () => {
  it("should return an array of the same length", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it("should contain the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it("should not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("should handle empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("should handle single element", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});
