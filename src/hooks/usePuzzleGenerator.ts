import { useTransition, useCallback, useRef, useEffect } from "react";
import { usePuzzleStore } from "@/store/puzzle-store";

interface UsePuzzleGeneratorOptions<T> {
  parseWords: (text: string) => { word: string; clue: string }[] | null;
  validate: (words: { word: string; clue: string }[]) => string | null;
  generate: (words: { word: string; clue: string }[], extra: Record<string, unknown>) => T;
  onResult: (result: T) => void;
  onWords: (words: { word: string; clue: string }[]) => void;
  onTitle: (title: string) => void;
}

export function usePuzzleGenerator<T>(options: UsePuzzleGeneratorOptions<T>) {
  const { setError } = usePuzzleStore();
  const [isPending, startTransition] = useTransition();
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  const generate = useCallback(
    (text: string, title: string, extra: Record<string, unknown> = {}) => {
      const { current: opts } = optionsRef;
      const words = opts.parseWords(text);
      if (!words) {
        setError(opts.validate([]) ?? "Formato inválido");
        return;
      }

      const validationError = opts.validate(words);
      if (validationError) {
        setError(validationError);
        return;
      }

      opts.onWords(words);
      opts.onTitle(title);
      setError(null);

      startTransition(() => {
        try {
          const result = opts.generate(words, extra);
          opts.onResult(result);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error al generar");
        }
      });
    },
    [setError],
  );

  return { generate, isPending };
}
