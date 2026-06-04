import { useState, useCallback, useMemo } from "react";
import Card from "../../ui/Card";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { generateSentenceOrderPDF } from "../../../lib/pdf/sentence-order";
import DownloadDropdown from "../../ui/DownloadDropdown";
import { Eye, RotateCcw, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import type { SentenceOrderSentence, SentenceOrderResult } from "../../../lib/puzzles/sentence-order/types";

type SentenceStatus = "pending" | "correct" | "incorrect";

interface SentenceState {
  answer: string[];
  status: SentenceStatus;
}

function SentenceOrderGame({ result, title }: { result: SentenceOrderResult; title: string }) {
  const { sentences } = result;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<SentenceState[]>(() =>
    sentences.map(() => ({ answer: [], status: "pending" as SentenceStatus }))
  );

  const currentSentence = sentences[currentIndex];
  const currentState = states[currentIndex];

  const handleWordClick = useCallback((word: string) => {
    setStates((prev) => {
      const next = [...prev];
      const state = next[currentIndex];
      if (state.status !== "pending") return prev;

      next[currentIndex] = {
        ...state,
        answer: [...state.answer, word],
        status: "pending",
      };
      return next;
    });
  }, [currentIndex]);

  const handleRemoveWord = useCallback((index: number) => {
    setStates((prev) => {
      const next = [...prev];
      const state = next[currentIndex];
      if (state.status !== "pending") return prev;

      next[currentIndex] = {
        ...state,
        answer: state.answer.filter((_, i) => i !== index),
      };
      return next;
    });
  }, [currentIndex]);

  const handleVerify = useCallback(() => {
    setStates((prev) => {
      const next = [...prev];
      const state = next[currentIndex];
      const isCorrect = state.answer.join(" ") === currentSentence.original;
      next[currentIndex] = {
        ...state,
        status: isCorrect ? "correct" : "incorrect",
      };
      return next;
    });
  }, [currentIndex, currentSentence.original]);

  const handleReset = useCallback(() => {
    setStates(sentences.map(() => ({ answer: [], status: "pending" as SentenceStatus })));
    setCurrentIndex(0);
  }, [sentences]);

  const handleResetSentence = useCallback(() => {
    setStates((prev) => {
      const next = [...prev];
      next[currentIndex] = { answer: [], status: "pending" };
      return next;
    });
  }, [currentIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, sentences.length - 1));
  }, [sentences.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const completedCount = states.filter((s) => s.status === "correct").length;

  const availableWords = useMemo(() => {
    const used = currentState.answer;
    const remaining = [...currentSentence.shuffled];
    for (const word of used) {
      const idx = remaining.indexOf(word);
      if (idx !== -1) remaining.splice(idx, 1);
    }
    return remaining;
  }, [currentSentence.shuffled, currentState.answer]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Juego interactivo</h2>
          <DownloadDropdown
            groups={[
              {
                label: "PDF",
                options: [
                  { label: "Ver en navegador", icon: Eye, onClick: () => generateSentenceOrderPDF(result, "students", title, "preview") },
                  { label: "Descargar sin soluciones", onClick: () => generateSentenceOrderPDF(result, "students", title, "download") },
                  { label: "Descargar con soluciones", onClick: () => generateSentenceOrderPDF(result, "solution", title, "download") },
                ],
              },
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
              Oración {currentIndex + 1} / {sentences.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === sentences.length - 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {completedCount}/{sentences.length} correctas
            </span>
            <button
              onClick={handleResetSentence}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
              title="Reiniciar esta oración"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-4">Haz click en las palabras para ordenar la oración:</p>

          <div className="min-h-[60px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-4">
            {currentState.answer.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Haz click en las palabras de abajo</p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {currentState.answer.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleRemoveWord(i)}
                    disabled={currentState.status !== "pending"}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed ${
                      currentState.status === "correct"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : currentState.status === "incorrect"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-red-400 hover:text-red-600"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {availableWords.map((word, i) => (
              <button
                key={i}
                onClick={() => handleWordClick(word)}
                disabled={currentState.status !== "pending"}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {word}
              </button>
            ))}
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
                  onClick={handleResetSentence}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Oraciones</h2>
        <div className="grid gap-2">
          {sentences.map((s: SentenceOrderSentence, i: number) => {
            const state = states[i];
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-all cursor-pointer ${
                  i === currentIndex
                    ? "bg-indigo-50 border border-indigo-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-indigo-600">
                    {i + 1}.
                  </span>
                  <span className="text-gray-700 truncate max-w-xs">
                    {s.original}
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

      {completedCount === sentences.length && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
            Felicitaciones! Completaste todas las oraciones
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

export default function SentenceOrderPreview() {
  const { sentenceOrderResult, sentenceOrderTitle } = usePuzzleStore();

  if (!sentenceOrderResult) return null;

  return (
    <SentenceOrderGame
      key={sentenceOrderResult.sentences.map((s) => s.original).join(",")}
      result={sentenceOrderResult}
      title={sentenceOrderTitle}
    />
  );
}
