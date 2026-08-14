import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CirclePause, CirclePlay, Clock3, RotateCcw, SkipForward, XCircle } from "lucide-react";
import { answerRoscoEntry, createRoscoGameState, isRoscoComplete, passRoscoEntry, type RoscoEntryStatus } from "@/lib/puzzles/rosco/game";
import type { RoscoEntry } from "@/lib/puzzles/rosco/types";

interface RoscoGameProps {
  entries: RoscoEntry[];
  durationSeconds: number;
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

const STATUS_STYLES: Record<RoscoEntryStatus, string> = {
  pending: "bg-white border-gray-300 text-gray-700",
  passed: "bg-amber-50 border-amber-500 text-amber-800",
  correct: "bg-emerald-100 border-emerald-600 text-emerald-800",
  incorrect: "bg-red-100 border-red-600 text-red-800",
};

const STATUS_LABELS: Record<RoscoEntryStatus, string> = {
  pending: "pendiente",
  passed: "pasapalabra",
  correct: "correcta",
  incorrect: "incorrecta",
};

function formatTime(total: number): string {
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

export default function RoscoGame({ entries, durationSeconds, title, attemptCount, onAttemptIncrement }: RoscoGameProps) {
  const [game, setGame] = useState(() => createRoscoGameState(entries));
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [paused, setPaused] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const completed = isRoscoComplete(game);
  const timedOut = remainingSeconds === 0;
  const ended = completed || timedOut;
  const current = entries[game.currentIndex]!;

  useEffect(() => {
    if (paused || ended) return;
    const interval = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [paused, ended]);

  useEffect(() => {
    if (!ended && !paused) inputRef.current?.focus();
  }, [game.currentIndex, ended, paused]);

  const totals = useMemo(() => ({
    correct: game.statuses.filter((status) => status === "correct").length,
    incorrect: game.statuses.filter((status) => status === "incorrect").length,
    pending: game.statuses.filter((status) => status === "pending" || status === "passed").length,
  }), [game.statuses]);

  const submitAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    if (ended || paused || !answer.trim()) return;
    const next = answerRoscoEntry(game, current, answer);
    const correct = next.statuses[game.currentIndex] === "correct";
    setGame(next);
    setFeedback(correct ? `Correcto: ${current.answer}.` : `Incorrecto. La respuesta era ${current.answer}.`);
    setAnswer("");
  };

  const pass = () => {
    if (ended || paused) return;
    setGame(passRoscoEntry(game));
    setAnswer("");
    setFeedback(`Pasapalabra: ${current.letter} queda para la próxima vuelta.`);
  };

  const restart = () => {
    setGame(createRoscoGameState(entries));
    setRemainingSeconds(durationSeconds);
    setPaused(false);
    setAnswer("");
    setFeedback("Nueva partida iniciada.");
    onAttemptIncrement?.();
  };

  const relation = current.rule === "starts-with" ? "Empieza con" : "Contiene la";

  return (
    <section className="space-y-5" aria-labelledby="rosco-game-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="rosco-game-title" className="text-xl font-bold text-gray-900">{title || "Rosco"}</h1>
          <p className="text-sm text-gray-500">Vuelta {game.round} · {totals.pending} pendientes</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {attemptCount !== undefined && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Intento #{attemptCount}</span>}
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${paused ? "bg-amber-100 text-amber-800" : "bg-indigo-50 text-indigo-800"}`} aria-label={paused ? "Cronómetro pausado" : `Tiempo restante ${formatTime(remainingSeconds)}`}>
            <Clock3 className="h-4 w-4" aria-hidden="true" /> {formatTime(remainingSeconds)}
          </span>
          <button type="button" onClick={() => setPaused((value) => !value)} disabled={ended} className="cursor-pointer inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            {paused ? <CirclePlay className="h-4 w-4" aria-hidden="true" /> : <CirclePause className="h-4 w-4" aria-hidden="true" />}{paused ? "Reanudar" : "Pausar"}
          </button>
          <button type="button" onClick={restart} className="cursor-pointer inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Reiniciar</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div className="mx-auto aspect-square w-full max-w-100 relative" role="list" aria-label="Estado de las letras del rosco">
          <div className="absolute inset-[18%] rounded-full border-8 border-indigo-100 bg-linear-to-br from-indigo-50 to-white shadow-inner" aria-hidden="true" />
          <div className="absolute inset-[31%] z-10 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm border border-gray-100 px-3" aria-hidden="true">
            <span className="text-2xl font-bold text-indigo-700">{totals.correct}</span><span className="text-xs text-gray-500">aciertos</span>
          </div>
          {entries.map((entry, index) => {
            const angle = (index / entries.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 43;
            const y = 50 + Math.sin(angle) * 43;
            const status = game.statuses[index]!;
            const active = index === game.currentIndex && !ended;
            return <div key={entry.letter} role="listitem" aria-label={`${entry.letter}: ${active ? "activa" : STATUS_LABELS[status]}`} className={`absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm sm:h-10 sm:w-10 ${STATUS_STYLES[status]} ${active ? "ring-4 ring-indigo-300 scale-110" : ""}`} style={{ left: `${x}%`, top: `${y}%` }}>
              {status === "correct" ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : status === "incorrect" ? <XCircle className="h-4 w-4" aria-hidden="true" /> : entry.letter}
            </div>;
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          {ended ? (
            <div className="space-y-5">
              <div className={`rounded-xl p-4 ${timedOut ? "bg-amber-50 text-amber-900" : "bg-indigo-50 text-indigo-900"}`}>
                <h2 className="text-xl font-bold">{timedOut ? "Se terminó el tiempo" : "¡Rosco completado!"}</h2>
                <p className="mt-1 text-sm">{totals.correct} correctas · {totals.incorrect} incorrectas · {totals.pending} sin responder</p>
              </div>
              <ol className="max-h-80 space-y-2 overflow-y-auto pr-1" aria-label="Soluciones del rosco">
                {entries.map((entry) => <li key={entry.letter} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"><strong className="text-indigo-700">{entry.letter}.</strong> {entry.answer} <span className="text-gray-500">— {entry.clue}</span></li>)}
              </ol>
              <button type="button" onClick={restart} className="cursor-pointer inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Jugar de nuevo</button>
            </div>
          ) : (
            <form onSubmit={submitAnswer} className="space-y-5">
              <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-800">{relation} {current.letter}</span><span className="text-xs font-medium text-gray-500">Letra {game.currentIndex + 1} de 26</span></div>
              <h2 className="text-xl font-semibold leading-relaxed text-gray-900">{current.clue}</h2>
              <label htmlFor="rosco-answer" className="block text-sm font-medium text-gray-700">Tu respuesta</label>
              <input ref={inputRef} id="rosco-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={paused} autoComplete="off" spellCheck={false} className="input-field w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg outline-none disabled:bg-gray-100" placeholder="Escribí la respuesta" />
              <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={paused || !answer.trim()} className="cursor-pointer inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Responder</button><button type="button" onClick={pass} disabled={paused} className="cursor-pointer inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"><SkipForward className="h-4 w-4" aria-hidden="true" /> Pasapalabra</button></div>
              {paused && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">La partida está en pausa.</p>}
            </form>
          )}
          <p className="sr-only" aria-live="polite">{feedback}</p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500">Estados: pendiente, pasapalabra, <span className="font-medium text-emerald-700">✓ correcta</span>, <span className="font-medium text-red-700">✕ incorrecta</span>.</p>
    </section>
  );
}
