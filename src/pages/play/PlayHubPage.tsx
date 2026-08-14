import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, KeyRound, ArrowRight, Link2 } from "lucide-react";
import { loadPuzzle } from "@/lib/share/api";
import { PUZZLE_TYPE_TO_SLUG } from "@/lib/puzzles/slugs";
import type { PlayablePuzzleType } from "@/lib/share/types";

export default function PlayHubPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedCode = code.trim().toLowerCase();
    if (!normalizedCode) {
      setError("Ingresá un código de puzzle");
      return;
    }

    if (normalizedCode.length !== 8) {
      setError("El código debe tener exactamente 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const data = await loadPuzzle(normalizedCode);
      const type = data.type as PlayablePuzzleType;
      const route = PUZZLE_TYPE_TO_SLUG[type];
      if (!route) {
        setError("Tipo de puzzle no reconocido");
        return;
      }
      navigate(`/jugar/${route}/${normalizedCode}`);
    } catch {
      setError("Puzzle no encontrado. Verificá el código e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] px-1 py-2 sm:px-4 sm:py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 sm:mb-12">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-700 no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        <section className="space-y-6" aria-labelledby="play-hub-title">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <KeyRound className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 id="play-hub-title" className="text-3xl font-bold tracking-tight text-gray-900">Abrí tu puzzle</h1>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-gray-500 sm:text-base">
              Pegá el código que te compartió tu docente para empezar a jugar.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="puzzle-code" className="block text-sm font-semibold text-gray-800">Código del puzzle</label>
                <input
                  id="puzzle-code"
                  name="puzzle-code"
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); if (error) setError(""); }}
                  placeholder="Ej.: F3D78213"
                  maxLength={8}
                  pattern="[A-Za-z0-9]{8}"
                  aria-describedby={error ? "puzzle-code-error" : "puzzle-code-help"}
                  aria-invalid={Boolean(error)}
                  className="input-field w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-center font-mono text-xl font-semibold tracking-[0.18em] uppercase outline-none placeholder:tracking-normal sm:text-left"
                  disabled={loading}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  enterKeyHint="go"
                />
                <p id="puzzle-code-help" className="text-xs leading-relaxed text-gray-500">Son 8 caracteres. Podés pegarlo directamente desde el mensaje del docente.</p>
              </div>

              {error && (
                <div id="puzzle-code-error" role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Buscando puzzle…</> : <>Jugar ahora <ArrowRight className="h-5 w-5" aria-hidden="true" /></>}
              </button>
            </form>
          </div>

          <aside className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900">
            <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
            <p><span className="font-semibold">¿Tenés un enlace?</span> Abrilo directamente: no necesitás ingresar el código de nuevo.</p>
          </aside>
        </section>
      </div>
    </div>
  );
}
