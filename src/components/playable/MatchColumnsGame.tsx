import { useState, useCallback, useMemo } from "react";
import { RotateCcw, Trophy, Link } from "lucide-react";

interface MatchColumnsGameProps {
  matches: { word: string; definition: string }[];
  shuffledDefinitions: string[];
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

export default function MatchColumnsGame({
  matches,
  shuffledDefinitions,
  title,
  attemptCount,
  onAttemptIncrement,
}: MatchColumnsGameProps) {
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [matchedWords, setMatchedWords] = useState<Map<number, number>>(new Map());
  const [wrongAttempt, setWrongAttempt] = useState<{ wordIdx: number; defIdx: number } | null>(null);
  const [shakeDefIdx, setShakeDefIdx] = useState<number | null>(null);

  const isComplete = matchedWords.size === matches.length;

  const handleWordClick = useCallback(
    (wordIdx: number) => {
      if (matchedWords.has(wordIdx)) return;
      setSelectedWord(wordIdx);
    },
    [matchedWords]
  );

  const handleDefinitionClick = useCallback(
    (defIdx: number) => {
      if (selectedWord === null) return;
      if ([...matchedWords.values()].includes(defIdx)) return;

      const correctDef = matches[selectedWord]!.definition;
      if (shuffledDefinitions[defIdx] === correctDef) {
        setMatchedWords((prev) => new Map(prev).set(selectedWord, defIdx));
        setSelectedWord(null);
      } else {
        setWrongAttempt({ wordIdx: selectedWord, defIdx });
        setShakeDefIdx(defIdx);
        setTimeout(() => {
          setWrongAttempt(null);
          setShakeDefIdx(null);
        }, 800);
      }
    },
    [selectedWord, matches, shuffledDefinitions, matchedWords]
  );

  const handleReset = useCallback(() => {
    setSelectedWord(null);
    setMatchedWords(new Map());
    setWrongAttempt(null);
    setShakeDefIdx(null);
    onAttemptIncrement?.();
  }, [onAttemptIncrement]);

  const handleNewGame = useCallback(() => {
    setSelectedWord(null);
    setMatchedWords(new Map());
    setWrongAttempt(null);
    setShakeDefIdx(null);
  }, []);

  const wordRefs = useMemo(() => matches.map(() => ({ current: null as HTMLDivElement | null })), [matches]);
  const defRefs = useMemo(() => shuffledDefinitions.map(() => ({ current: null as HTMLDivElement | null })), [shuffledDefinitions]);

  const lines = useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const ITEM_HEIGHT = 44;
    const GAP = 8;
    const STEP = ITEM_HEIGHT + GAP;

    matchedWords.forEach((defIdx, wordIdx) => {
      const y1 = wordIdx * STEP + ITEM_HEIGHT / 2;
      const y2 = defIdx * STEP + ITEM_HEIGHT / 2;
      result.push({ x1: 0, y1, x2: 0, y2 });
    });

    return result;
  }, [matchedWords]);

  const getWordClass = (wordIdx: number) => {
    if (matchedWords.has(wordIdx)) {
      return "bg-emerald-50 border-emerald-300 text-emerald-700";
    }
    if (selectedWord === wordIdx) {
      return "bg-indigo-50 border-indigo-300 text-indigo-700";
    }
    if (wrongAttempt && wrongAttempt.wordIdx === wordIdx) {
      return "bg-red-50 border-red-300 text-red-700";
    }
    return "bg-white border-gray-200 text-gray-800";
  };

  const getDefinitionClass = (defIdx: number) => {
    const isMatched = [...matchedWords.values()].includes(defIdx);
    if (isMatched) {
      return "bg-emerald-50 border-emerald-300 text-emerald-700";
    }
    if (wrongAttempt && wrongAttempt.defIdx === defIdx) {
      return "bg-red-50 border-red-300 text-red-700";
    }
    return "bg-white border-gray-200 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>

      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      {isComplete && (
        <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-700">Felicidades!</p>
          <p className="text-sm text-green-600 mb-3">
            Todos los pares emparejados correctamente
          </p>
          <button
            onClick={handleNewGame}
            className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            Jugar de nuevo
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          {matchedWords.size}/{matches.length} emparejados
        </span>
        {attemptCount !== undefined && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Intento #{attemptCount}
          </span>
        )}
        <button
          onClick={handleReset}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="relative" style={{ minHeight: matches.length * 52 }}>
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ zIndex: 10 }}
          >
            {lines.map((line, i) => {
              const containerWidth = 600;
              const leftColWidth = containerWidth * 0.4;
              const rightColStart = containerWidth * 0.6;
              const x1 = leftColWidth - 8;
              const x2 = rightColStart + 8;
              const midX = (x1 + x2) / 2;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${x2} ${line.y2}`}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                  opacity="0.7"
                />
              );
            })}
          </svg>

          <div className="grid grid-cols-[1fr_1fr] gap-4 relative" style={{ zIndex: 1 }}>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                <Link className="w-3.5 h-3.5 inline mr-1" />
                Palabras
              </h3>
              <div className="space-y-2">
                {matches.map((m, wordIdx) => (
                  <div
                    key={wordIdx}
                    ref={(el) => { wordRefs[wordIdx]!.current = el; }}
                  >
                    <button
                      onClick={() => handleWordClick(wordIdx)}
                      disabled={matchedWords.has(wordIdx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer disabled:cursor-default ${getWordClass(wordIdx)}`}
                    >
                      {m.word}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                <Link className="w-3.5 h-3.5 inline mr-1" />
                Definiciones
              </h3>
              <div className="space-y-2">
                {shuffledDefinitions.map((def, defIdx) => (
                  <div
                    key={defIdx}
                    ref={(el) => { defRefs[defIdx]!.current = el; }}
                  >
                    <button
                      onClick={() => handleDefinitionClick(defIdx)}
                      disabled={[...matchedWords.values()].includes(defIdx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer disabled:cursor-default ${getDefinitionClass(defIdx)} ${shakeDefIdx === defIdx ? "animate-shake" : ""}`}
                    >
                      {def}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
