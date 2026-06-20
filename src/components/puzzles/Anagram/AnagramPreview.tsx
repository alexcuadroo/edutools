import { useState, useCallback, useMemo } from "react";
import Card from "../../ui/Card";
import ShareModal from "../../ui/ShareModal";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateAnagramPDF } from "../../../lib/pdf/anagram";
import DownloadDropdown from "../../ui/DownloadDropdown";
import { savePuzzle, buildPlayUrl } from "../../../lib/share/api";
import { anagramResultToPlayData } from "../../../lib/share/types";
import { Eye, RotateCcw, ChevronLeft, ChevronRight, Check, X, Share2, Loader2 } from "lucide-react";
import type { AnagramWord, AnagramResult } from "../../../lib/puzzles/anagram/types";
import { toast } from "react-toastify";

type WordStatus = "pending" | "correct" | "incorrect";

interface WordState {
  answer: string;
  status: WordStatus;
}

function AnagramGame({ result, title, onShare, sharing }: { result: AnagramResult; title: string; onShare?: () => void; sharing?: boolean }) {
  const { words } = result;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordStates, setWordStates] = useState<WordState[]>(() =>
    words.map(() => ({ answer: "", status: "pending" as WordStatus }))
  );

  const currentWord = words[currentWordIndex]!;
  const currentState = wordStates[currentWordIndex]!;

  const handleAnswerChange = useCallback((answer: string) => {
    setWordStates((prev) => {
      const next = [...prev];
      const state = next[currentWordIndex]!;
      next[currentWordIndex] = {
        ...state,
        answer: answer.toUpperCase().replace(/\s/g, ""),
        status: "pending",
      };
      return next;
    });
  }, [currentWordIndex]);

  const handleVerify = useCallback(() => {
    setWordStates((prev) => {
      const next = [...prev];
      const state = next[currentWordIndex]!;
      const isCorrect = state.answer === currentWord.word;
      next[currentWordIndex] = {
        ...state,
        status: isCorrect ? "correct" : "incorrect",
      };
      return next;
    });
  }, [currentWordIndex, currentWord.word]);

  const handleReset = useCallback(() => {
    setWordStates(words.map(() => ({ answer: "", status: "pending" as WordStatus })));
    setCurrentWordIndex(0);
  }, [words]);

  const handleResetWord = useCallback(() => {
    setWordStates((prev) => {
      const next = [...prev];
      const state = next[currentWordIndex]!;
      next[currentWordIndex] = { ...state, answer: "", status: "pending" };
      return next;
    });
  }, [currentWordIndex]);

  const goNext = useCallback(() => {
    setCurrentWordIndex((i) => Math.min(i + 1, words.length - 1));
  }, [words.length]);

  const goPrev = useCallback(() => {
    setCurrentWordIndex((i) => Math.max(i - 1, 0));
  }, []);

  const completedCount = wordStates.filter((s) => s.status === "correct").length;

  const scrambledLetters = useMemo(
    () => currentWord.scrambled.split(""),
    [currentWord.scrambled]
  );

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
                    { label: "Ver en navegador", icon: Eye, onClick: () => generateAnagramPDF(result, "students", title, "preview") },
                    { label: "Descargar sin soluciones", onClick: () => generateAnagramPDF(result, "students", title, "download") },
                    { label: "Descargar con soluciones", onClick: () => generateAnagramPDF(result, "solution", title, "download") },
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
              {completedCount}/{words.length} correctas
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
          <p className="text-sm text-gray-500 mb-4">Ordena las letras para formar la palabra:</p>

          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {scrambledLetters.map((letter, i) => (
              <div
                key={i}
                className="w-11 h-12 flex items-center justify-center text-xl font-bold bg-indigo-100 text-indigo-700 border-2 border-indigo-300 rounded-xl shadow-sm"
              >
                {letter}
              </div>
            ))}
          </div>

          {currentWord.clue && (
            <p className="text-sm text-gray-500 italic mb-4">
              Pista: {currentWord.clue}
            </p>
          )}

          <div className="max-w-xs mx-auto mb-4">
            <input
              type="text"
              value={currentState.answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Escribe tu respuesta"
              className={`w-full text-center text-lg font-bold py-3 px-4 rounded-xl border-2 outline-none transition-all ${
                currentState.status === "correct"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : currentState.status === "incorrect"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-300 focus:border-indigo-500"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
            />
          </div>

          {currentState.status === "pending" && (
            <button
              onClick={handleVerify}
              disabled={currentState.answer.length === 0}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Verificar
            </button>
          )}

          {currentState.status === "correct" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
              <Check className="w-4 h-4" />
              Correcto!
            </div>
          )}

          {currentState.status === "incorrect" && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium">
                <X className="w-4 h-4" />
                Incorrecto, intenta de nuevo
              </div>
              <div>
                <button
                  onClick={handleResetWord}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Intentar otra vez
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Palabras</h2>
        <div className="grid gap-2">
          {words.map((w: AnagramWord, i: number) => {
            const state = wordStates[i]!;
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
                    {w.clue || w.scrambled}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  state.status === "correct"
                    ? "bg-emerald-100 text-emerald-700"
                    : state.status === "incorrect"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {state.status === "correct" ? "OK" : state.status === "incorrect" ? "X" : "..."}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {completedCount === words.length && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
            Felicitaciones! Completaste todos los anagramas
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
    </div>
  );
}

export default function AnagramPreview() {
  const { anagramResult, anagramTitle } = usePuzzleStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  if (!anagramResult) return null;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const data = anagramResultToPlayData(anagramResult, anagramTitle);
      const id = await savePuzzle({ type: "anagram", puzzle: data });
      const url = buildPlayUrl("anagrama", id);
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
      <AnagramGame
        key={anagramResult.words.map((w) => w.word).join(",")}
        result={anagramResult}
        title={anagramTitle}
        onShare={handleShare}
        sharing={sharing}
      />
      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={anagramTitle || "Anagrama"}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
