import { useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";

interface HangmanGameProps {
  words: { word: string; clue?: string }[];
  maxAttempts: number;
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789".split("");

export default function HangmanGame({ words, maxAttempts, title, attemptCount, onAttemptIncrement }: HangmanGameProps) {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");

  const currentWord = words[currentWordIdx]!;
  const wordLetters = currentWord.word.split("");

  const handleGuess = useCallback(
    (letter: string) => {
      if (gameStatus !== "playing" || guessedLetters.has(letter)) return;

      const newGuessed = new Set(guessedLetters);
      newGuessed.add(letter);
      setGuessedLetters(newGuessed);

      if (!currentWord.word.includes(letter)) {
        const newErrors = errors + 1;
        setErrors(newErrors);
        if (newErrors >= maxAttempts) {
          setGameStatus("lost");
        }
      } else {
        const allRevealed = wordLetters.every((l) => newGuessed.has(l));
        if (allRevealed) {
          setGameStatus("won");
        }
      }
    },
    [gameStatus, guessedLetters, currentWord, errors, maxAttempts, wordLetters]
  );

  const handleNext = useCallback(() => {
    if (currentWordIdx < words.length - 1) {
      setCurrentWordIdx(currentWordIdx + 1);
      setGuessedLetters(new Set());
      setErrors(0);
      setGameStatus("playing");
    }
  }, [currentWordIdx, words.length]);

  const handleReset = useCallback(() => {
    setCurrentWordIdx(0);
    setGuessedLetters(new Set());
    setErrors(0);
    setGameStatus("playing");
    onAttemptIncrement?.();
  }, [onAttemptIncrement]);

  const revealedLetters = wordLetters.map((l) => (guessedLetters.has(l) ? l : "_"));

  return (
    <div className="space-y-6">
      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
        {attemptCount !== undefined && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Intento #{attemptCount}
          </span>
        )}
        {gameStatus !== "playing" && currentWordIdx < words.length - 1 && (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Siguiente palabra
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
          <div className="flex gap-1 text-lg">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <span key={i}>{i < maxAttempts - errors ? "❤️" : "❌"}</span>
            ))}
          </div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Palabra {currentWordIdx + 1}/{words.length}
          </span>
        </div>

        {currentWord.clue && (
          <p className="text-center text-sm text-gray-600 mb-4 italic">
            Pista: {currentWord.clue}
          </p>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {revealedLetters.map((letter, idx) => (
            <div
              key={idx}
              className="w-8 h-10 flex items-center justify-center border-b-2 border-gray-800 font-mono text-xl font-bold"
            >
              {letter !== "_" ? letter : ""}
            </div>
          ))}
        </div>

        {gameStatus === "won" && (
          <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-bold text-green-700">Correcto!</p>
          </div>
        )}

        {gameStatus === "lost" && (
          <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-lg font-bold text-red-700">La palabra era: {currentWord.word}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Caracteres disponibles</h3>
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
          {ALPHABET.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isCorrect = isGuessed && currentWord.word.includes(letter);
            const isWrong = isGuessed && !currentWord.word.includes(letter);

            let bgColor = "bg-gray-100 text-gray-700 hover:bg-gray-200";
            if (isCorrect) bgColor = "bg-green-100 text-green-700";
            if (isWrong) bgColor = "bg-red-100 text-red-400 line-through";

            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isGuessed || gameStatus !== "playing"}
                className={`py-2 rounded-lg text-sm font-bold transition-colors ${bgColor} disabled:cursor-not-allowed`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
