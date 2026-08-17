import { create } from "zustand";
import type { PlayablePuzzleType } from "@/lib/share/types";

export interface SavedPuzzle {
  id: string;
  type: string;
  title: string;
  createdAt: number;
  shareCount: number;
  data?: unknown;
}

interface SavedPuzzlesState {
  puzzles: SavedPuzzle[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  save: (type: PlayablePuzzleType, title: string, data: unknown) => Promise<string>;
  remove: (id: string) => Promise<void>;
  share: (id: string) => Promise<{ shareId: string; url: string }>;
  get: (id: string) => SavedPuzzle | undefined;
  loadOne: (id: string) => Promise<SavedPuzzle>;
}

export const useSavedPuzzlesStore = create<SavedPuzzlesState>((set, get) => ({
  puzzles: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/puzzles/saved");
      if (!response.ok) {
        throw new Error("Error al cargar tus puzzles");
      }
      const data = await response.json();
      set({ puzzles: data });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error desconocido" });
    } finally {
      set({ loading: false });
    }
  },

  save: async (type, title, data) => {
    const response = await fetch("/api/puzzles/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, data }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Error desconocido" }));
      throw new Error(error.error || "Error al guardar el puzzle");
    }

    const result = await response.json();
    await get().fetch();
    return result.id;
  },

  remove: async (id) => {
    const response = await fetch(`/api/puzzles/saved/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Error al eliminar el puzzle");
    }
    set((state) => ({
      puzzles: state.puzzles.filter((puzzle) => puzzle.id !== id),
    }));
  },

  share: async (id) => {
    const response = await fetch(`/api/puzzles/saved/${id}/share`, { method: "POST" });
    if (!response.ok) {
      throw new Error("Error al compartir el puzzle");
    }
    const result = await response.json();
    set((state) => ({
      puzzles: state.puzzles.map((puzzle) =>
        puzzle.id === id
          ? { ...puzzle, shareCount: puzzle.shareCount + 1 }
          : puzzle
      ),
    }));
    return result;
  },

  get: (id) => {
    return get().puzzles.find((p) => p.id === id);
  },

  loadOne: async (id) => {
    const response = await fetch(`/api/puzzles/saved/${id}`);
    if (!response.ok) {
      throw new Error("Puzzle no encontrado");
    }
    const data = await response.json();
    const puzzle: SavedPuzzle = {
      id,
      type: data.type,
      title: "",
      createdAt: 0,
      shareCount: 0,
      data: data.puzzle,
    };
    set((state) => ({
      puzzles: state.puzzles.map((p) => (p.id === id ? { ...p, data: data.puzzle } : p)),
    }));
    return puzzle;
  },
}));
