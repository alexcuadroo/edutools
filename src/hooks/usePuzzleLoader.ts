import { useState, useEffect, useRef } from "react";
import { loadPuzzle } from "@/lib/share/api";

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

    loadPuzzle(id)
      .then((payload) => {
        if (!cancelled) {
          setData(decodeRef.current(payload.puzzle));
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}
