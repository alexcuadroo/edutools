import { useState, useCallback, useEffect, useMemo } from "react";
import Card from "../../ui/Card";
import ShareModal from "../../ui/ShareModal";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateHangmanPDF } from "../../../lib/pdf/hangman";
import DownloadDropdown from "../../ui/DownloadDropdown";
import { savePuzzle, buildPlayUrl } from "../../../lib/share/api";
import { hangmanResultToPlayData } from "../../../lib/share/types";
import { Eye, RotateCcw, ChevronLeft, ChevronRight, Share2, Loader2 } from "lucide-react";
import type { HangmanWord, HangmanResult } from "../../../lib/puzzles/hangman/types";
import { toast } from "react-toastify";

const LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789".split("");

type GameStatus = "playing" | "won" | "lost";

interface WordGameState {
  guessedLetters: Set<string>;
  wrongLetters: string[];
  status: GameStatus;
}

function getDisplayWord(word: string, guessed: Set<string>): string[] {
  return word.split("").map((letter) =>
    guessed.has(letter) ? letter : "_"
  );
}

function checkWin(word: string, guessed: Set<string>): boolean {
  return word.split("").every((letter) => guessed.has(letter));
}

function createInitialStates(words: HangmanWord[]): WordGameState[] {
  return words.map(() => ({
    guessedLetters: new Set<string>(),
    wrongLetters: [],
    status: "playing" as GameStatus,
  }));
}

function HangmanGame({ result, title, onShare, sharing }: { result: HangmanResult; title: string; onShare?: () => void; sharing?: boolean }) {
  const { words, maxAttempts } = result;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gameStates, setGameStates] = useState<WordGameState[]>(() =>
    createInitialStates(words)
  );

  const currentWord = words[currentWordIndex]!;
  const currentState = gameStates[currentWordIndex]!;
  const displayWord = useMemo(
    () => getDisplayWord(currentWord.word, currentState.guessedLetters),
    [currentWord.word, currentState.guessedLetters]
  );
  const remainingAttempts = maxAttempts - currentState.wrongLetters.length;

  const handleLetterClick = useCallback((letter: string) => {
    setGameStates((prev) => {
      const state = prev[currentWordIndex]!;
      if (state.status !== "playing" || state.guessedLetters.has(letter)) {
        return prev;
      }

      const next = [...prev];
      const updated = { ...state };
      updated.guessedLetters = new Set(state.guessedLetters);
      updated.guessedLetters.add(letter);

      const word = words[currentWordIndex]!.word;
      if (!word.includes(letter)) {
        updated.wrongLetters = [...state.wrongLetters, letter];
        if (updated.wrongLetters.length >= maxAttempts) {
          updated.status = "lost";
        }
      } else if (checkWin(word, updated.guessedLetters)) {
        updated.status = "won";
      }

      next[currentWordIndex] = updated;
      return next;
    });
  }, [currentWordIndex, words, maxAttempts]);

  const handleReset = useCallback(() => {
    setGameStates(createInitialStates(words));
    setCurrentWordIndex(0);
  }, [words]);

  const handleResetWord = useCallback(() => {
    setGameStates((prev) => {
      const next = [...prev];
      const state = next[currentWordIndex]!;
      next[currentWordIndex] = {
        ...state,
        guessedLetters: new Set<string>(),
        wrongLetters: [],
        status: "playing",
      };
      return next;
    });
  }, [currentWordIndex]);

  const goNext = useCallback(() => {
    setCurrentWordIndex((i) => Math.min(i + 1, words.length - 1));
  }, [words.length]);

  const goPrev = useCallback(() => {
    setCurrentWordIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "Ñ" || (key.length === 1 && ((key >= "A" && key <= "Z") || (key >= "0" && key <= "9")))) {
        handleLetterClick(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLetterClick]);

  const completedCount = gameStates.filter((s) => s.status !== "playing").length;
  const wonCount = gameStates.filter((s) => s.status === "won").length;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Juego interactivo</h2>
          <div className="flex items-center gap-3">
            {onShare && (
              <button
                onClick={onShare}
                disabled={sharing}
                className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors border border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                {sharing ? "Generando..." : "Compartir"}
              </button>
            )}
            <DownloadDropdown
              groups={[
                {
                  label: "PDF",
                  options: [
                    { label: "Ver en navegador", icon: Eye, onClick: () => generateHangmanPDF(result, "students", title, "preview") },
                    { label: "Descargar sin soluciones", onClick: () => generateHangmanPDF(result, "students", title, "download") },
                    { label: "Descargar con soluciones", onClick: () => generateHangmanPDF(result, "solution", title, "download") },
                  ],
                },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentWordIndex === 0}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
              Palabra {currentWordIndex + 1} / {words.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentWordIndex === words.length - 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {wonCount}/{words.length} completadas
            </span>
            <button
              onClick={handleResetWord}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
              title="Reiniciar esta palabra"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
            {displayWord.map((letter, i) => (
              <div
                key={i}
                className={`w-9 h-11 flex items-center justify-center text-xl font-bold border-b-3 rounded-t-lg transition-all duration-200 ${
                  letter === "_"
                    ? "border-gray-300 text-transparent"
                    : currentState.status === "won"
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : "border-indigo-500 text-indigo-700"
                }`}
              >
                {letter === "_" ? "\u00A0" : letter}
              </div>
            ))}
          </div>

          {currentWord.clue && (
            <p className="text-sm text-gray-500 italic mb-4">
              Pista: {currentWord.clue}
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5 mb-4 text-lg">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <span key={i}>{i < remainingAttempts ? "❤️" : "❌"}</span>
            ))}
          </div>

          {currentState.status === "won" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium animate-bounce-in">
              Correcto!
            </div>
          )}
          {currentState.status === "lost" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium">
              La palabra era: <span className="font-bold">{currentWord.word}</span>
            </div>
          )}
        </div>

        {currentState.wrongLetters.length > 0 && (
          <div className="text-center mb-4">
            <span className="text-xs text-gray-400">Letras incorrectas: </span>
            <span className="text-sm font-mono text-red-500">
              {currentState.wrongLetters.join(" ")}
            </span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
          {LETTERS.map((letter) => {
            const isGuessed = currentState.guessedLetters.has(letter);
            const isWrong = currentState.wrongLetters.includes(letter);
            const isCorrect = isGuessed && currentWord.word.includes(letter);
            const isDisabled = isGuessed || currentState.status !== "playing";

            return (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={isDisabled}
                className={`w-9 h-10 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
                  isCorrect
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : isWrong
                    ? "bg-red-100 text-red-400 border border-red-200 line-through"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {completedCount === words.length && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
              Juego terminado! {wonCount}/{words.length} palabras correctas
            </div>
            <div className="mt-3">
              <button
                onClick={handleReset}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Jugar de nuevo
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Palabras</h2>
        <div className="grid gap-2">
          {words.map((w: HangmanWord, i: number) => {
            const state = gameStates[i]!;
            return (
              <button
                key={i}
                onClick={() => setCurrentWordIndex(i)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-all cursor-pointer ${
                  i === currentWordIndex
                    ? "bg-indigo-50 border border-indigo-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-indigo-600">
                    {i + 1}.
                  </span>
                  <span className="text-gray-700">
                    {w.clue || w.word}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  state.status === "won"
                    ? "bg-emerald-100 text-emerald-700"
                    : state.status === "lost"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {state.status === "won" ? "OK" : state.status === "lost" ? "X" : "..."}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default function HangmanPreview() {
  const { hangmanResult, hangmanTitle } = usePuzzleStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  if (!hangmanResult) return null;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const data = hangmanResultToPlayData(hangmanResult, hangmanTitle);
      const id = await savePuzzle({ type: "hangman", puzzle: data });
      const url = buildPlayUrl("adivina-la-palabra", id);
      setShareUrl(url);
      setShareOpen(true);
    } catch {
      toast.error("No se pudo generar el link para compartir");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <HangmanGame
        key={hangmanResult.words.map((w) => w.word).join(",")}
        result={hangmanResult}
        title={hangmanTitle}
        onShare={handleShare}
        sharing={sharing}
      />
      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={hangmanTitle || "Adivina la Palabra"}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
