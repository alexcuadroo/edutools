import { useState, useCallback, useEffect } from "react";
import { RotateCcw, Trophy, Link } from "lucide-react";
import type { ProgressSnapshot } from "@/lib/progress/types";

interface MatchColumnsGameProps {
  matches: { word: string; definition: string }[];
  shuffledDefinitions: string[];
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
  onProgress?: (progress: ProgressSnapshot) => void;
}

const PAIR_COLORS = [
  "bg-sky-100 border-sky-400 text-sky-800",
  "bg-amber-100 border-amber-400 text-amber-800",
  "bg-violet-100 border-violet-400 text-violet-800",
  "bg-rose-100 border-rose-400 text-rose-800",
  "bg-teal-100 border-teal-400 text-teal-800",
  "bg-orange-100 border-orange-400 text-orange-800",
  "bg-cyan-100 border-cyan-400 text-cyan-800",
  "bg-fuchsia-100 border-fuchsia-400 text-fuchsia-800",
];

export default function MatchColumnsGame({
  matches,
  shuffledDefinitions,
  title,
  attemptCount,
  onAttemptIncrement,
  onProgress,
}: MatchColumnsGameProps) {
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [matchedWords, setMatchedWords] = useState<Map<number, number>>(new Map());
  const [wrongAttempt, setWrongAttempt] = useState<{ wordIdx: number; defIdx: number } | null>(null);
  const [shakeDefIdx, setShakeDefIdx] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);

  const isComplete = matchedWords.size === matches.length;
  useEffect(() => { onProgress?.({ correctItems: [...matchedWords.keys()].map((index) => matches[index]!.word), incorrectItems: [], total: matches.length, completed: isComplete }); }, [isComplete, matchedWords, matches, onProgress]);

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
        setErrors((e) => e + 1);
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
    setErrors(0);
    onAttemptIncrement?.();
  }, [onAttemptIncrement]);

  const handleNewGame = useCallback(() => {
    setSelectedWord(null);
    setMatchedWords(new Map());
    setWrongAttempt(null);
    setShakeDefIdx(null);
  }, []);

  const getWordClass = (wordIdx: number) => {
    if (matchedWords.has(wordIdx)) {
      return PAIR_COLORS[wordIdx % PAIR_COLORS.length]!;
    }
    if (selectedWord === wordIdx) {
      return "bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-200";
    }
    if (wrongAttempt && wrongAttempt.wordIdx === wordIdx) {
      return "bg-red-50 border-red-300 text-red-700";
    }
    return "bg-white border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50";
  };

  const getDefinitionClass = (defIdx: number) => {
    const matchedEntry = [...matchedWords.entries()].find(([, d]) => d === defIdx);
    if (matchedEntry) {
      return PAIR_COLORS[matchedEntry[0]! % PAIR_COLORS.length]!;
    }
    if (wrongAttempt && wrongAttempt.defIdx === defIdx) {
      return "bg-red-50 border-red-300 text-red-700";
    }
    return "bg-white border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50";
  };

  const getPairNumber = (wordIdx: number): number | null => {
    if (!matchedWords.has(wordIdx)) return null;
    return wordIdx + 1;
  };

  const getDefPairNumber = (defIdx: number): number | null => {
    const entry = [...matchedWords.entries()].find(([, d]) => d === defIdx);
    if (!entry) return null;
    return entry[0]! + 1;
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
        <div className="text-center py-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
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
        {errors > 0 && (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            {errors} {errors === 1 ? "error" : "errores"}
          </span>
        )}
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
        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              <Link className="w-3.5 h-3.5 inline mr-1" />
              Palabras
            </h3>
            <div className="space-y-2">
              {matches.map((m, wordIdx) => (
                <div key={wordIdx} className="relative">
                  <button
                    onClick={() => handleWordClick(wordIdx)}
                    disabled={matchedWords.has(wordIdx)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer disabled:cursor-default ${getWordClass(wordIdx)}`}
                  >
                    {m.word}
                  </button>
                  {getPairNumber(wordIdx) !== null && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-white border text-[10px] font-bold text-gray-600 shadow-sm">
                      {getPairNumber(wordIdx)}
                    </span>
                  )}
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
                <div key={defIdx} className="relative">
                  <button
                    onClick={() => handleDefinitionClick(defIdx)}
                    disabled={[...matchedWords.values()].includes(defIdx)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer disabled:cursor-default ${getDefinitionClass(defIdx)} ${shakeDefIdx === defIdx ? "animate-shake" : ""}`}
                  >
                    {def}
                  </button>
                  {getDefPairNumber(defIdx) !== null && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-white border text-[10px] font-bold text-gray-600 shadow-sm">
                      {getDefPairNumber(defIdx)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
