import { useState, useCallback } from "react";
import { RotateCcw, CheckCircle, Lightbulb } from "lucide-react";

interface AnagramGameProps {
  words: { word: string; clue?: string; scrambled: string }[];
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

const MAX_HINTS = 3;

interface WordState {
  answer: string[];
  answerSource: (number | null)[];
  usedScrambled: Set<number>;
  hintPositions: Set<number>;
  hintsUsed: number;
}

function createInitialStates(words: { word: string }[]): WordState[] {
  return words.map((w) => ({
    answer: Array(w.word.length).fill(""),
    answerSource: Array(w.word.length).fill(null),
    usedScrambled: new Set<number>(),
    hintPositions: new Set<number>(),
    hintsUsed: 0,
  }));
}

export default function AnagramGame({ words, title, attemptCount, onAttemptIncrement }: AnagramGameProps) {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [wordStates, setWordStates] = useState<WordState[]>(() => createInitialStates(words));
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [score, setScore] = useState(0);

  const currentWord = words[currentWordIdx]!;
  const currentState = wordStates[currentWordIdx]!;
  const scrambledLetters = currentWord.scrambled.split("");
  const hintsRemaining = MAX_HINTS - currentState.hintsUsed;

  const getRandomHintPosition = useCallback(() => {
    const wordLength = currentWord.word.length;
    const availablePositions = Array.from({ length: wordLength }, (_, i) => i).filter(
      (pos) => !currentState.hintPositions.has(pos) && !currentState.answer[pos]
    );

    if (availablePositions.length === 0) return null;

    const randomIdx = Math.floor(Math.random() * availablePositions.length);
    return availablePositions[randomIdx];
  }, [currentWord.word, currentState.hintPositions, currentState.answer]);

  const handleLetterClick = useCallback(
    (letter: string, scrambledIdx: number) => {
      if (checked) return;
      if (currentState.usedScrambled.has(scrambledIdx)) return;

      setWordStates((prev) => {
        const next = [...prev];
        const state = next[currentWordIdx]!;
        const emptyIdx = state.answer.findIndex((l) => !l);
        if (emptyIdx === -1) return prev;
        const newAnswer = [...state.answer];
        const newSource = [...state.answerSource];
        newAnswer[emptyIdx] = letter;
        newSource[emptyIdx] = scrambledIdx;
        const newUsed = new Set(state.usedScrambled);
        newUsed.add(scrambledIdx);
        next[currentWordIdx] = { ...state, answer: newAnswer, answerSource: newSource, usedScrambled: newUsed };
        return next;
      });
    },
    [checked, currentWordIdx, currentState.usedScrambled]
  );

  const handleRemoveLetter = useCallback(
    (idx: number) => {
      if (checked) return;
      setWordStates((prev) => {
        const next = [...prev];
        const state = next[currentWordIdx]!;
        if (!state.answer[idx]) return prev;
        const scrambledIdx = state.answerSource[idx]!;
        const newAnswer = [...state.answer];
        const newSource = [...state.answerSource];
        newAnswer[idx] = "";
        newSource[idx] = null as unknown as number;
        const newUsed = new Set(state.usedScrambled);
        if (scrambledIdx !== null) newUsed.delete(scrambledIdx);
        next[currentWordIdx] = { ...state, answer: newAnswer, answerSource: newSource, usedScrambled: newUsed };
        return next;
      });
    },
    [checked, currentWordIdx]
  );

  const handleCheck = useCallback(() => {
    const answer = currentState.answer.join("");
    const correct = answer === currentWord.word;
    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      setScore(score + 1);
      if (currentWordIdx < words.length - 1) {
        setTimeout(() => {
          setCurrentWordIdx(currentWordIdx + 1);
          setChecked(false);
          setIsCorrect(false);
        }, 1500);
      } else {
        setCelebration(true);
      }
    }
  }, [currentState.answer, currentWord, currentWordIdx, words.length, score]);

  const handleNext = useCallback(() => {
    if (currentWordIdx < words.length - 1) {
      setCurrentWordIdx(currentWordIdx + 1);
      setChecked(false);
      setIsCorrect(false);
    }
  }, [currentWordIdx, words.length]);

  const handleReset = useCallback(() => {
    setWordStates(createInitialStates(words));
    setCurrentWordIdx(0);
    setChecked(false);
    setIsCorrect(false);
    setCelebration(false);
    setScore(0);
    onAttemptIncrement?.();
  }, [words, onAttemptIncrement]);

  const handleHint = useCallback(() => {
    if (currentState.hintsUsed >= MAX_HINTS) return;
    if (checked) return;

    const pos = getRandomHintPosition();
    if (pos === null) return;

    setWordStates((prev) => {
      const next = [...prev];
      const state = next[currentWordIdx]!;
      const newAnswer = [...state.answer];
      newAnswer[pos!] = currentWord.word[pos!]!;
      const newHints = new Set(state.hintPositions);
      newHints.add(pos!);
      next[currentWordIdx] = {
        ...state,
        answer: newAnswer,
        hintPositions: newHints,
        hintsUsed: state.hintsUsed + 1,
      };
      return next;
    });
  }, [currentState.hintsUsed, checked, getRandomHintPosition, currentWordIdx, currentWord.word]);

  return (
    <div className="space-y-6">
      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      {celebration && (
        <div className="text-center py-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-700">Felicidades!</p>
          <p className="text-sm text-green-600">
            Completaste todos los anagramas ({score}/{words.length})
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
          disabled={currentState.answer.filter(Boolean).length !== currentWord.word.length || checked}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          Comprobar
        </button>
        <button
          onClick={handleHint}
          disabled={checked || hintsRemaining === 0}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lightbulb className="w-4 h-4" />
          Pista ({hintsRemaining})
        </button>
        {checked && !isCorrect && currentWordIdx < words.length - 1 && (
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
            Anagrama {currentWordIdx + 1}/{words.length}
          </span>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            Puntaje: {score}
          </span>
        </div>

        {currentWord.clue && (
          <p className="text-center text-sm text-gray-600 mb-4 italic">
            Pista: {currentWord.clue}
          </p>
        )}

        <div className="flex justify-center gap-2 mb-6 min-h-12">
          {currentWord.word.split("").map((_, idx) => (
            <div
              key={idx}
              onClick={() => handleRemoveLetter(idx)}
              className={`w-10 h-12 flex items-center justify-center border-2 rounded-lg font-mono text-xl font-bold cursor-pointer transition-colors ${
                checked
                  ? isCorrect
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-500 bg-red-50 text-red-700"
                  : currentState.hintPositions.has(idx)
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : currentState.answer[idx]
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              {currentState.answer[idx] || ""}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {scrambledLetters.map((letter, idx) => {
            const isUsed = currentState.usedScrambled.has(idx);
            return (
              <button
                key={idx}
                onClick={() => handleLetterClick(letter, idx)}
                disabled={isUsed || checked}
                className={`w-10 h-12 flex items-center justify-center rounded-lg font-mono text-xl font-bold transition-colors cursor-pointer ${
                  isUsed
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                } disabled:cursor-not-allowed`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {checked && isCorrect && (
          <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-bold text-green-700">Correcto!</p>
          </div>
        )}

        {checked && !isCorrect && (
          <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-lg font-bold text-red-700">
              Incorrecto. La respuesta era: {currentWord.word}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
