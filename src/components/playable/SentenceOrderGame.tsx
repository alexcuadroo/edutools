import { useState, useCallback } from "react";
import { RotateCcw, CheckCircle } from "lucide-react";

interface SentenceOrderGameProps {
  sentences: { original: string; shuffled: string[] }[];
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

export default function SentenceOrderGame({ sentences, title, attemptCount, onAttemptIncrement }: SentenceOrderGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [score, setScore] = useState(0);

  const currentSentence = sentences[currentIdx]!;

  const initializeWords = useCallback(() => {
    setAvailableWords([...currentSentence.shuffled]);
    setUserOrder([]);
  }, [currentSentence]);

  useState(() => {
    initializeWords();
  });

  const handleWordClick = useCallback(
    (word: string, idx: number) => {
      if (checked) return;

      const newOrder = [...userOrder, word];
      setUserOrder(newOrder);

      const newAvailable = availableWords.filter((_, i) => i !== idx);
      setAvailableWords(newAvailable);
    },
    [checked, userOrder, availableWords]
  );

  const handleRemoveWord = useCallback(
    (idx: number) => {
      if (checked) return;

      const word = userOrder[idx]!;
      const newOrder = userOrder.filter((_, i) => i !== idx);
      setUserOrder(newOrder);

      setAvailableWords([...availableWords, word]);
    },
    [checked, userOrder, availableWords]
  );

  const handleCheck = useCallback(() => {
    const userSentence = userOrder.join(" ");
    const correct = userSentence === currentSentence.original;
    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      setScore(score + 1);
      if (currentIdx < sentences.length - 1) {
        setTimeout(() => {
          setCurrentIdx(currentIdx + 1);
          setUserOrder([]);
          setAvailableWords([...sentences[currentIdx + 1]!.shuffled]);
          setChecked(false);
          setIsCorrect(false);
        }, 1500);
      } else {
        setCelebration(true);
      }
    }
  }, [userOrder, currentSentence, currentIdx, sentences, score]);

  const handleNext = useCallback(() => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserOrder([]);
      setAvailableWords([...sentences[currentIdx + 1]!.shuffled]);
      setChecked(false);
      setIsCorrect(false);
    }
  }, [currentIdx, sentences]);

  const handleReset = useCallback(() => {
    setCurrentIdx(0);
    setUserOrder([]);
    setAvailableWords([...sentences[0]!.shuffled]);
    setChecked(false);
    setIsCorrect(false);
    setCelebration(false);
    setScore(0);
    onAttemptIncrement?.();
  }, [sentences, onAttemptIncrement]);

  return (
    <div className="space-y-6">
      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      {celebration && (
        <div className="text-center py-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-700">¡Listo!</p>
          <p className="text-sm text-green-600">
            Ordenaste ({score}/{sentences.length}) oraciones correctamente
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
        {attemptCount !== undefined && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Intento #{attemptCount}
          </span>
        )}
        <button
          onClick={handleCheck}
          disabled={userOrder.length !== currentSentence.shuffled.length || checked}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          Comprobar
        </button>
        {checked && !isCorrect && currentIdx < sentences.length - 1 && (
          <button
            onClick={handleNext}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Siguiente
          </button>
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
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Oración {currentIdx + 1}/{sentences.length}
          </span>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            Puntaje: {score}
          </span>
        </div>

        <div className="min-h-16 bg-gray-50 rounded-lg p-4 mb-6 border-2 border-dashed border-gray-300">
          {userOrder.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">
              Haz clic en las palabras para ordenar la oración
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userOrder.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveWord(idx)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    checked
                      ? isCorrect
                        ? "bg-green-100 text-green-700 border-2 border-green-500"
                        : "bg-red-100 text-red-700 border-2 border-red-500"
                      : "bg-indigo-100 text-indigo-700 border-2 border-indigo-300 hover:bg-indigo-200"
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {availableWords.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleWordClick(word, idx)}
              disabled={checked}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {word}
            </button>
          ))}
        </div>

        {checked && isCorrect && (
          <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-bold text-green-700">Correcto!</p>
          </div>
        )}

        {checked && !isCorrect && (
          <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-lg font-bold text-red-700">
              Incorrecto. La oración correcta es: {currentSentence.original}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
