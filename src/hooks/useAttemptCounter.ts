import { useState, useCallback, useEffect, useMemo, useRef } from "react";

export function useAttemptCounter(puzzleType: string, hash: string) {
  const key = useMemo(() => `intento_${puzzleType}_${hash}`, [puzzleType, hash]);

  const readAndIncrement = useCallback(() => {
    let current = 0;
    try {
      const stored = localStorage.getItem(key);
      current = stored ? (Number(stored) || 0) : 0;
    } catch {
      // ignore
    }
    const next = current + 1;
    try {
      localStorage.setItem(key, String(next));
    } catch {
      // ignore
    }
    return next;
  }, [key]);

  const [count, setCount] = useState(readAndIncrement);
  const mountedKey = useRef(key);

  useEffect(() => {
    if (mountedKey.current === key) return;
    mountedKey.current = key;
    setCount(readAndIncrement());
  }, [key, readAndIncrement]);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(key, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [key]);

  return { count, increment };
}
