import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { useSavedPuzzlesStore, type SavedPuzzle } from "@/store/saved-puzzles-store";
import type {
  AnagramPlayData,
  CWPlayData,
  FBPlayData,
  HangmanPlayData,
  MCPlayData,
  MemPlayData,
  RoscoPlayData,
  SOPlayData,
  WSPlayData,
  WordlePlayData,
} from "@/lib/share/types";
import { WS_DIRECTIONS, WS_DIRECTION_LABELS, type WSDirection } from "@/lib/puzzles/word-search/types";

interface SavedPuzzleSolutionProps {
  puzzle: SavedPuzzle;
  onClose: () => void;
}

function SolutionGrid({
  grid,
  numbers,
  highlights,
}: {
  grid: (string | null)[][];
  numbers?: Record<string, number>;
  highlights?: Set<string>;
}) {
  const columns = Math.max(1, ...grid.map((row) => row.length));
  const cellSize = Math.min(36, 520 / columns);

  return (
    <div className="max-w-full overflow-auto rounded-lg bg-gray-100 p-2">
      <div className="mx-auto grid w-max" style={{ gridTemplateColumns: `repeat(${columns}, ${cellSize}px)` }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const isBlack = cell === null;
            return (
              <div
                key={key}
                className="relative flex items-center justify-center border border-gray-300 font-mono font-semibold text-gray-900"
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize: Math.max(9, cellSize * 0.48),
                  backgroundColor: isBlack ? "#d1d5db" : highlights?.has(key) ? "#bfdbfe" : "white",
                }}
              >
                {!isBlack && cell}
                {!isBlack && numbers?.[key] !== undefined && (
                  <span className="absolute left-0.5 top-0 text-[8px] leading-none text-gray-600">{numbers[key]}</span>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

function AnswerList({ children }: { children: ReactNode }) {
  return <ul className="space-y-2">{children}</ul>;
}

function PuzzleAnswer({ puzzle }: { puzzle: SavedPuzzle }) {
  const data = puzzle.data as Record<string, unknown> | undefined;

  if (!data) return <p className="text-sm text-gray-600">No se pudieron cargar los datos de este puzzle.</p>;

  switch (puzzle.type) {
    case "word-search": {
      const solution = data as unknown as WSPlayData;
      const marked = new Set<string>();
      for (const word of solution.w ?? []) {
        const [dr, dc] = WS_DIRECTIONS[word.d as WSDirection] ?? [0, 1];
        for (let i = 0; i < word.w.length; i++) marked.add(`${word.r + dr * i},${word.col + dc * i}`);
      }
      return (
        <div className="space-y-4">
          <SolutionGrid grid={solution.g ?? []} highlights={marked} />
          <section>
            <h3 className="mb-2 font-semibold text-gray-900">Palabras encontradas</h3>
            <div className="flex flex-wrap gap-2">
              {(solution.w ?? []).map((word, index) => (
                <span key={`${word.w}-${index}`} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-900">
                  {word.w} <span aria-label={`dirección ${WS_DIRECTION_LABELS[word.d as WSDirection]}`}>{WS_DIRECTION_LABELS[word.d as WSDirection]}</span>
                </span>
              ))}
            </div>
          </section>
        </div>
      );
    }
    case "crossword": {
      const solution = data as unknown as CWPlayData;
      const across = solution.w?.filter((word) => word.d === "across") ?? [];
      const down = solution.w?.filter((word) => word.d === "down") ?? [];
      return (
        <div className="space-y-4">
          <SolutionGrid grid={solution.g ?? []} numbers={solution.n} />
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Horizontales", across], ["Verticales", down]].map(([label, entries]) => (
              <section key={label as string}>
                <h3 className="mb-2 font-semibold text-gray-900">{label as string}</h3>
                <AnswerList>
                  {(entries as CWPlayData["w"]).map((word) => (
                    <li key={`${word.n}-${word.d}`} className="flex gap-2 text-sm">
                      <span className="font-semibold text-indigo-700">{word.n}.</span>
                      <span>{word.c} <strong className="text-emerald-700">— {word.w}</strong></span>
                    </li>
                  ))}
                </AnswerList>
              </section>
            ))}
          </div>
        </div>
      );
    }
    case "fill-blanks": {
      const solution = data as unknown as FBPlayData;
      const blanksByToken = new Map((solution.b ?? []).map((blank) => [blank.i, blank.w]));
      const tokens = (solution.txt ?? "").match(/\s+|[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+|[^\sa-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+/g) ?? [];
      return (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Texto completo</h3>
          <p className="rounded-lg bg-emerald-50 p-4 text-base leading-8 text-gray-900">
            {tokens.map((token, index) => {
              const answer = blanksByToken.get(index);
              return answer ? <strong key={index} className="rounded bg-emerald-100 px-1 text-emerald-900">{answer}</strong> : <span key={index}>{token}</span>;
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            {(solution.b ?? []).map((blank, index) => <span key={`${blank.i}-${index}`} className="rounded bg-gray-100 px-2.5 py-1 text-sm"><span className="text-gray-500">Hueco {index + 1}:</span> <strong>{blank.w}</strong></span>)}
          </div>
        </div>
      );
    }
    case "hangman": {
      const solution = data as unknown as HangmanPlayData;
      return <AnswerList>{(solution.w ?? []).map((entry, index) => <li key={`${entry.w}-${index}`} className="rounded-lg bg-gray-50 p-3"><strong className="text-indigo-800">{entry.w}</strong>{entry.c && <span className="text-gray-600"> — {entry.c}</span>}</li>)}</AnswerList>;
    }
    case "anagram": {
      const solution = data as unknown as AnagramPlayData;
      return <AnswerList>{(solution.w ?? []).map((entry, index) => <li key={`${entry.w}-${index}`} className="rounded-lg bg-gray-50 p-3 text-sm"><span className="mr-2 text-gray-500">{entry.s}</span><span aria-hidden="true">→</span><strong className="ml-2 text-emerald-700">{entry.w}</strong>{entry.c && <span className="text-gray-600"> — {entry.c}</span>}</li>)}</AnswerList>;
    }
    case "sentence-order": {
      const solution = data as unknown as SOPlayData;
      return <AnswerList>{(solution.s ?? []).map((entry, index) => <li key={`${entry.o}-${index}`} className="rounded-lg bg-emerald-50 p-3"><span className="mr-2 text-sm text-gray-500">{index + 1}.</span><strong className="text-gray-900">{entry.o}</strong></li>)}</AnswerList>;
    }
    case "match-columns": {
      const solution = data as unknown as MCPlayData;
      return <AnswerList>{(solution.m ?? []).map((entry, index) => <li key={`${entry.w}-${index}`} className="grid gap-1 rounded-lg bg-gray-50 p-3 sm:grid-cols-2 sm:gap-4"><strong className="text-indigo-800">{entry.w}</strong><span className="text-gray-700">{entry.d}</span></li>)}</AnswerList>;
    }
    case "memory": {
      const solution = data as unknown as MemPlayData;
      return <AnswerList>{(solution.p ?? []).map((pair, index) => <li key={`${pair.w}-${index}`} className="grid gap-1 rounded-lg bg-gray-50 p-3 sm:grid-cols-2 sm:gap-4"><strong className="text-indigo-800">{pair.w}</strong><span className="text-gray-700">{pair.d}</span></li>)}</AnswerList>;
    }
    case "rosco": {
      const solution = data as unknown as RoscoPlayData;
      return <AnswerList>{(solution.e ?? []).map((entry, index) => <li key={`${entry.l}-${index}`} className="rounded-lg bg-gray-50 p-3"><strong className="mr-2 text-indigo-800">{entry.l}.</strong><strong className="text-emerald-700">{entry.a}</strong><span className="text-gray-600"> — {entry.c}</span></li>)}</AnswerList>;
    }
    case "wordle": {
      const solution = data as unknown as WordlePlayData;
      const words = solution.p?.length ? solution.p : [{ w: solution.w, c: solution.c }];
      return <AnswerList>{words.map((entry, index) => <li key={`${entry.w}-${index}`} className="rounded-lg bg-gray-50 p-3"><strong className="text-emerald-700">{entry.w}</strong>{entry.c && <span className="text-gray-600"> — {entry.c}</span>}</li>)}</AnswerList>;
    }
    default:
      return <p className="text-sm text-gray-600">La solución no está disponible para este tipo de puzzle.</p>;
  }
}

export default function SavedPuzzleSolution({ puzzle, onClose }: SavedPuzzleSolutionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const loadOne = useSavedPuzzlesStore((state) => state.loadOne);
  const [data, setData] = useState<unknown>(puzzle.data);
  const [loading, setLoading] = useState(!puzzle.data);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (puzzle.data) return;
    let cancelled = false;
    loadOne(puzzle.id)
      .then((loaded) => {
        if (!cancelled) setData(loaded.data);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la solución.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [loadOne, puzzle.data, puzzle.id]);

  const puzzleWithData = useMemo(() => ({ ...puzzle, data }), [data, puzzle]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="saved-puzzle-solution-title"
      className="m-auto max-h-[90vh] w-[min(96vw,48rem)] rounded-2xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-slate-950/50"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Solución</p>
            <h2 id="saved-puzzle-solution-title" className="mt-1 text-lg font-semibold text-gray-950">{puzzle.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar solución" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-gray-600"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /> Cargando solución...</div>
          ) : error ? (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>
          ) : (
            <PuzzleAnswer puzzle={puzzleWithData} />
          )}
        </div>
      </div>
    </dialog>
  );
}
