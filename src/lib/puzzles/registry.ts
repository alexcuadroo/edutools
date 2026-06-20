import type { IPuzzleGenerator, PuzzleType } from "@/lib/puzzles/types";

const registry = new Map<PuzzleType, IPuzzleGenerator>();

export function registerPuzzle(generator: IPuzzleGenerator) {
  registry.set(generator.id, generator);
}

export function getPuzzle(id: PuzzleType): IPuzzleGenerator | undefined {
  return registry.get(id);
}

export function getAllPuzzles(): IPuzzleGenerator[] {
  return Array.from(registry.values());
}
