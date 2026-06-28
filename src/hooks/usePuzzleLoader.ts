import { useState, useEffect, useRef } from "react";
import { loadPuzzle } from "@/lib/share/api";
import { useSavedPuzzlesStore } from "@/store/saved-puzzles-store";

export function usePuzzleLoader<T>(
  id: string | undefined,
  decode: (data: unknown) => T
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const decodeRef = useRef(decode);

  useEffect(() => {
    decodeRef.current = decode;
  });

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const store = useSavedPuzzlesStore.getState();
    const savedPuzzle = store.puzzles.find((p) => p.id === id);

    const applyData = (payload: unknown) => {
      if (cancelled) return;
      setData(decodeRef.current(payload));
      setError(false);
      setLoading(false);
    };

    const handleError = () => {
      if (cancelled) return;
      setError(true);
      setLoading(false);
    };

    if (savedPuzzle?.data) {
      applyData(savedPuzzle.data);
      return;
    }

    if (savedPuzzle) {
      store
        .loadOne(id)
        .then((puzzle) => applyData(puzzle.data))
        .catch(handleError);
      return;
    }

    loadPuzzle(id)
      .then((payload) => applyData(payload.puzzle))
      .catch(handleError);

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}
