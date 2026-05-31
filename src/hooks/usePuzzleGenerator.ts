import { useTransition, useCallback } from "react";
import { usePuzzleStore } from "../store/puzzle-store";

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

  const generate = useCallback(
    (text: string, title: string, extra: Record<string, unknown> = {}) => {
      const words = options.parseWords(text);
      if (!words) {
        setError(options.validate([]) ?? "Formato inválido");
        return;
      }

      const validationError = options.validate(words);
      if (validationError) {
        setError(validationError);
        return;
      }

      options.onWords(words);
      options.onTitle(title);
      setError(null);

      startTransition(() => {
        try {
          const result = options.generate(words, extra);
          options.onResult(result);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error al generar");
        }
      });
    },
    [options, setError, startTransition],
  );

  return { generate, isPending };
}
