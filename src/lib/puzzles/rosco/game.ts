import type { RoscoEntry } from "@/lib/puzzles/rosco/types";
import { normalizeRoscoAnswer } from "@/lib/puzzles/rosco/generator";

export type RoscoEntryStatus = "pending" | "passed" | "correct" | "incorrect";

export interface RoscoGameState {
  statuses: RoscoEntryStatus[];
  currentIndex: number;
  round: number;
}

export function createRoscoGameState(entries: RoscoEntry[]): RoscoGameState {
  return { statuses: entries.map(() => "pending"), currentIndex: 0, round: 1 };
}

function nextUnresolved(statuses: RoscoEntryStatus[], fromIndex: number): number | null {
  for (let offset = 1; offset <= statuses.length; offset += 1) {
    const index = (fromIndex + offset) % statuses.length;
    const status = statuses[index];
    if (status === "pending" || status === "passed") return index;
  }
  return null;
}

function advance(state: RoscoGameState, statuses: RoscoEntryStatus[]): RoscoGameState {
  const next = nextUnresolved(statuses, state.currentIndex);
  if (next === null) return { ...state, statuses };
  return {
    statuses,
    currentIndex: next,
    round: next <= state.currentIndex ? state.round + 1 : state.round,
  };
}

export function passRoscoEntry(state: RoscoGameState): RoscoGameState {
  const statuses = [...state.statuses];
  statuses[state.currentIndex] = "passed";
  return advance(state, statuses);
}

export function answerRoscoEntry(state: RoscoGameState, entry: RoscoEntry, answer: string): RoscoGameState {
  const statuses = [...state.statuses];
  statuses[state.currentIndex] = normalizeRoscoAnswer(answer) === normalizeRoscoAnswer(entry.answer) ? "correct" : "incorrect";
  return advance(state, statuses);
}

export function isRoscoComplete(state: RoscoGameState): boolean {
  return state.statuses.every((status) => status === "correct" || status === "incorrect");
}
