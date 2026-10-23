import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Check,
  CircleHelp,
  Copy,
  Crosshair,
  FileDown,
  Gamepad2,
  Heart,
  Layers,
  Link2,
  ListOrdered,
  Loader2,
  Share2,
  Shuffle,
  TextCursorInput,
  AlertCircle,
  LetterText,
  Keyboard,
} from "lucide-react";
import { loadPuzzle } from "@/lib/share/api";
import { PUZZLE_TYPE_TO_SLUG } from "@/lib/puzzles/slugs";
import type { PlayablePuzzleType } from "@/lib/share/types";
import { useAuthStore } from "@/store/auth-store";

const MCP_PROMPT = `Usá EduTools para crear una sopa de letras titulada "Animales de granja" con estas palabras, una por línea:
gallina
vaca
oveja
caballo

Guardá el puzzle en mi cuenta y devolveme el enlace para jugar.`;

const PUZZLES = [
  { path: "/sopa-de-letras", title: "Sopa de Letras", detail: "Palabras, temas y cuadrícula personalizable.", icon: LetterText },
  { path: "/crucigrama", title: "Crucigrama", detail: "Pistas y solución listas para clase.", icon: Crosshair },
  { path: "/rellenar-huecos", title: "Rellenar Huecos", detail: "Textos con espacios y distractores.", icon: TextCursorInput },
  { path: "/adivina-la-palabra", title: "Adivina la Palabra", detail: "Definiciones para descubrir la respuesta.", icon: Heart },
  { path: "/anagrama", title: "Anagrama", detail: "Ordená letras y reforzá vocabulario.", icon: Shuffle },
  { path: "/ordenar-oracion", title: "Ordenar Oración", detail: "Construí oraciones paso a paso.", icon: ListOrdered },
  { path: "/relacionar-columnas", title: "Relacionar Columnas", detail: "Uní conceptos con sus definiciones.", icon: Link2 },
  { path: "/memoria", title: "Memoria", detail: "Pares de palabras y definiciones.", icon: Layers },
  { path: "/rosco", title: "Rosco", detail: "Preguntas, cronómetro y pasapalabra.", icon: CircleHelp },
  { path: "/cadenas-de-palabras", title: "Cadenas de Palabras", detail: "Un Wordle temático de 4 o más letras.", icon: Keyboard },
];

export default function HomePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [promptCopyError, setPromptCopyError] = useState(false);
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.status);
  const integrationsHref = authStatus === "anon" ? "/crear-cuenta" : "/integraciones";
  const isCodeComplete = code.trim().length === 8;

  const handleCopyMcpPrompt = async () => {
    try {
      await navigator.clipboard.writeText(MCP_PROMPT);
      setPromptCopied(true);
      setPromptCopyError(false);
      window.setTimeout(() => setPromptCopied(false), 2500);
    } catch {
      setPromptCopyError(true);
      setPromptCopied(false);
    }
  };

  const handlePlay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toLowerCase();
    setError("");

    if (normalizedCode.length !== 8) {
      setError("Ingresá los 8 caracteres del código de tu puzzle.");
      return;
    }

    setLoading(true);
    try {
      const puzzle = await loadPuzzle(normalizedCode);
      const route = PUZZLE_TYPE_TO_SLUG[puzzle.type as PlayablePuzzleType];
      if (!route) throw new Error("Tipo de puzzle no reconocido");
      navigate(`/jugar/${route}/${normalizedCode}`);
    } catch {
      setError("No encontramos ese puzzle. Revisá el código e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10">
      <section className="home-hero relative overflow-hidden rounded-4xl border px-5 py-8 shadow-[0_28px_80px_-42px_rgba(67,56,202,0.45)] sm:px-10 sm:py-12" aria-labelledby="home-title">
        <div className="landing-orb pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" aria-hidden="true" />
        <div className="landing-orb pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
          <div className="max-w-xl">
            <h1 id="home-title" className="home-hero-title text-balance text-4xl font-bold tracking-[-0.04em] sm:text-6xl">
              Aprender jugando empieza acá.
            </h1>
            <p className="home-hero-description mt-5 max-w-lg text-pretty text-base leading-relaxed sm:text-lg">
              Elegí cómo querés continuar: jugá una actividad que te compartieron o creá una nueva para tu clase.
            </p>
          </div>

          <section className="student-entry rounded-3xl bg-indigo-600 p-5 text-white shadow-[0_20px_50px_-24px_rgba(129,140,248,0.9)] sm:p-7" aria-labelledby="student-title">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"><Gamepad2 className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <p className="text-sm font-semibold text-indigo-100">Para estudiantes</p>
                <h2 id="student-title" className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">¿Tenés un código?</h2>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-indigo-100">Pegalo acá y entrá directo a tu puzzle. No necesitás cuenta.</p>
            <form className="mt-6" onSubmit={handlePlay} noValidate>
              <label htmlFor="home-puzzle-code" className="sr-only">Código del puzzle</label>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  id="home-puzzle-code"
                  value={code}
                  onChange={(event) => { setCode(event.target.value.toUpperCase()); if (error) setError(""); }}
                  placeholder="CÓDIGO DE 8 CARACTERES"
                  maxLength={8}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "home-code-error" : "home-code-help"}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  enterKeyHint="go"
                  disabled={loading}
                  className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-transparent bg-slate-950/80 px-4 text-center font-mono text-base font-bold tracking-[0.14em] text-white outline-none placeholder:text-xs placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-400 focus:border-amber-200 disabled:opacity-60 sm:text-left"
                />
                <button type="submit" disabled={loading || !isCodeComplete} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-300 px-6 text-sm font-bold text-amber-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando…</> : <>Jugar <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
                </button>
              </div>
              <p id="home-code-help" className="mt-2 text-xs text-indigo-100">El código tiene 8 caracteres. Si tenés un enlace, abrilo directamente.</p>
              {error && <p id="home-code-error" role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-950/25 p-2.5 text-sm text-white"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}</p>}
            </form>
          </section>

          <section className="home-hero-teacher border-t pt-6 lg:col-span-2 lg:flex lg:items-center lg:justify-between lg:gap-8" aria-labelledby="teacher-title">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300 text-emerald-950"><BookOpenCheck className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <p className="text-sm font-semibold text-emerald-700">Para docentes</p>
                <h2 id="teacher-title" className="home-hero-title mt-1 text-xl font-bold">Creá una actividad</h2>
                <p className="home-hero-description mt-2 max-w-xl text-sm leading-relaxed">Generá, imprimí o compartí puzzles para tu grupo. Guardar es opcional.</p>
              </div>
            </div>
            <a href="#actividades" className="home-hero-cta mt-5 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold no-underline transition-colors lg:mt-0">
              Crear un puzzle <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </section>
        </div>
      </section>

      <section className="mcp-promo mx-auto mt-8 grid max-w-5xl gap-6 overflow-hidden rounded-3xl border border-indigo-100 p-5 shadow-[0_22px_65px_-42px_rgba(67,56,202,0.55)] sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-center" aria-labelledby="mcp-title">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-800">
            <Bot className="h-4 w-4" aria-hidden="true" /> Nuevo · MCP
          </div>
          <h2 id="mcp-title" className="mt-4 max-w-xl text-balance text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Creá puzzles desde tu LLM favorito
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            Conectá EduTools a un cliente compatible con MCP. Pedí una actividad con tus propias palabras: EduTools la genera, la guarda en tu cuenta y te devuelve el enlace para jugar.
          </p>
          <ol className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-3 lg:grid-cols-1">
            <li className="flex items-center gap-2"><span className="mcp-promo-step inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-950">1</span>Creá tu token de conexión.</li>
            <li className="flex items-center gap-2"><span className="mcp-promo-step inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-950">2</span>Conectá el servidor MCP en tu LLM.</li>
            <li className="flex items-center gap-2"><span className="mcp-promo-step inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-950">3</span>Pedí un puzzle y recibí su link.</li>
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={integrationsHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md">
              {authStatus === "auth" ? "Configurar MCP" : authStatus === "anon" ? "Crear cuenta y conectar" : "Conectar MCP"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {authStatus === "anon" && <Link to="/iniciar-sesion" className="min-h-11 content-center text-sm font-semibold text-indigo-800 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-950">Ya tengo cuenta</Link>}
          </div>
          <p className="mt-3 text-xs text-slate-500">Tu contraseña no se comparte con el LLM. Usás un token que podés revocar cuando quieras.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Probalo en tu chat</p>
              <h3 className="mt-1 font-semibold text-slate-950">Copiá este mini prompt</h3>
            </div>
            <button type="button" onClick={() => void handleCopyMcpPrompt()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-indigo-600">
              {promptCopied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {promptCopied ? "Copiado" : "Copiar prompt"}
            </button>
          </div>
          <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 sm:text-sm">{MCP_PROMPT}</pre>
          <p aria-live="polite" className={`mt-2 min-h-5 text-xs ${promptCopyError ? "text-red-700" : "text-slate-500"}`}>
            {promptCopyError ? "No se pudo copiar. Seleccioná el texto para copiarlo manualmente." : promptCopied ? "Prompt copiado. Pegalo en tu LLM después de conectar EduTools." : "Primero conectá EduTools con el token de tu cuenta."}
          </p>
        </div>
      </section>

      <section id="actividades" className="mx-auto max-w-5xl scroll-mt-24 py-16 sm:py-24" aria-labelledby="catalog-title">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Para docentes</p>
            <h2 id="catalog-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Elegí el tipo de actividad</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PUZZLES.map((puzzle) => {
            const Icon = puzzle.icon;
            return (
              <Link key={puzzle.path} to={puzzle.path} className="group rounded-2xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_35px_-24px_rgba(67,56,202,0.8)] focus-visible:-translate-y-1">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <h3 className="font-semibold text-slate-950">{puzzle.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{puzzle.detail}</p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700">Crear actividad <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-slate-950 px-5 py-9 text-white sm:px-10 sm:py-12" aria-labelledby="how-title">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-violet-300">Un flujo simple</p>
          <h2 id="how-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Preparás una actividad. Ellos entran a jugar.</h2>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-400 font-bold text-violet-950">1</span>
            <h3 className="mt-4 font-semibold">Creá</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">Elegí un formato y cargá el contenido de tu clase.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-400 font-bold text-violet-950">2</span>
            <h3 className="mt-4 font-semibold">Compartí</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">Enviá un enlace o el código de ocho caracteres.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-400 font-bold text-violet-950">3</span>
            <h3 className="mt-4 font-semibold">Jugá</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">El estudiante entra desde arriba, sin crear una cuenta.</p>
          </li>
        </ol>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Sin instalar nada</span><span className="inline-flex items-center gap-2"><FileDown className="h-4 w-4 text-emerald-300" aria-hidden="true" /> PDF listo para imprimir</span><span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Enlace para compartir</span></div>
      </section>
    </div>
  );
}
