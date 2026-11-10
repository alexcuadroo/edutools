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
  Sparkles,
  Pause,
  Play,
  Terminal,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { DitheringBackground } from "@/components/ui/DitheringBackground";
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
  const [animationPaused, setAnimationPaused] = useState(false);
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
    <div className="pb-6 pt-1 sm:pt-3">
      <section className="home-hero relative isolate overflow-hidden rounded-[1.75rem] px-5 pt-6 sm:rounded-[2rem] sm:px-10 sm:pt-8 lg:px-12" aria-labelledby="home-title">
        <DitheringBackground paused={animationPaused} />
        <div className="pointer-events-none absolute inset-0 bg-[#fbfaf8]/45 bg-[linear-gradient(90deg,rgba(251,250,248,0.9),rgba(251,250,248,0.55)_38%,transparent_75%)] lg:bg-transparent" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <p className="flex items-center gap-2.5 font-mono text-[10px] font-medium tracking-[0.15em] text-[#74618e] sm:text-xs"><span className="h-2 w-2 bg-[#518464]" aria-hidden="true" /> UN POCO DE CURIOSIDAD. MUCHO JUEGO.</p>
          <button type="button" onClick={() => setAnimationPaused((value) => !value)} aria-label={animationPaused ? "Reanudar animación del fondo" : "Pausar animación del fondo"} aria-pressed={animationPaused} className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#dcd3e7] text-[#74618e] transition-colors hover:bg-[#ede7f5] motion-reduce:hidden">
            {animationPaused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        </div>
        <div className="relative grid gap-10 pb-12 pt-10 sm:pt-12 lg:grid-cols-[1.12fr_1fr] lg:items-center lg:gap-14 lg:pb-14">
          <div>
            <h1 id="home-title" className="text-[clamp(3.6rem,7.5vw,6.25rem)] font-[850] leading-[0.98] tracking-[-0.065em] text-[#282332]">
              Aprender<br />es un <span className="relative inline-block text-brand">juego<span className="text-[#488364]">.</span><svg className="absolute -bottom-3 left-0 h-3 w-full text-brand" viewBox="0 0 240 12" fill="none" aria-hidden="true"><path d="M2 9C55 1 154 0 237 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></span>
            </h1>
            <p className="mt-8 max-w-[23rem] text-pretty text-base leading-relaxed text-[#696273] sm:text-lg">Transformá lo que enseñás en algo que quieran jugar. Creá, compartí y despertá la curiosidad.</p>
            <a href="#actividades" className="mt-7 inline-flex min-h-12 items-center justify-center gap-4 rounded-xl bg-primary px-5 text-sm font-extrabold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_6px_24px_#7053a730]">Crear una actividad <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#746b7e]"><Check className="h-3.5 w-3.5 text-[#488364]" aria-hidden="true" /> Gratis. Sin instalar nada. A tu manera.</p>
          </div>

          <section className="student-entry relative rounded-2xl p-6 sm:p-8 lg:mt-8" aria-labelledby="student-title">
            <div className="absolute -top-4 right-5 rotate-[7deg] rounded-md border border-[#33265c] bg-[#d1c3ff] px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider text-[#33265c] shadow-sm">¡TU TURNO!</div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-primary"><Gamepad2 className="h-6 w-6" aria-hidden="true" /></span>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#746c82]">Para mentes curiosas</p>
            </div>
            <h2 id="student-title" className="mt-6 text-[1.9rem] font-extrabold leading-tight tracking-[-0.04em] text-[#242033]">¿Tenés un código?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b6477]">Tu próximo desafío empieza acá.<br />Ingresá el código y entrá a jugar.</p>
            <form className="mt-6" onSubmit={handlePlay} noValidate>
              <label htmlFor="home-puzzle-code" className="mb-2 block text-xs font-bold text-[#4b435d]">Código del puzzle</label>
              <div className="flex flex-col gap-3">
                <input
                  id="home-puzzle-code"
                  value={code}
                  onChange={(event) => { setCode(event.target.value.toUpperCase()); if (error) setError(""); }}
                  placeholder="Ej. A1B2C3D4"
                  maxLength={8}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "home-code-error" : "home-code-help"}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  enterKeyHint="go"
                  disabled={loading}
                  className="min-h-14 min-w-0 rounded-lg border border-[#d9d4e2] bg-[#efedf2] px-4 text-center font-mono text-lg font-semibold tracking-[0.18em] text-[#332846] outline-none transition-colors placeholder:text-sm placeholder:font-normal placeholder:tracking-[0.12em] placeholder:text-[#8c8399] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                <button type="submit" disabled={loading || !isCodeComplete} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-[#e4dfed] disabled:text-[#8a809d]">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando…</> : <>Vamos a jugar <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
                </button>
              </div>
              <p id="home-code-help" className="mt-3 text-center text-[11px] leading-relaxed text-[#746a82]">8 caracteres. Cero vueltas. No necesitás cuenta.</p>
              {error && <p id="home-code-error" role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-[#ffe6e4] p-2.5 text-sm text-[#9c2835]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}</p>}
            </form>
          </section>
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[#dcd4e5] py-5">
          <p className="flex items-center gap-2.5 text-xs font-semibold text-[#696073]"><BookOpenCheck className="h-4 w-4 text-[#488364]" aria-hidden="true" /> Hecho para enseñar. Diseñado para jugar.</p>
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-wide text-[#76648c]"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {PUZZLES.length} formatos · infinitas ideas</p>
        </div>
      </section>
      <section id="actividades" className="mx-auto scroll-mt-24 py-12 sm:py-16" aria-labelledby="catalog-title">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Para docentes</p>
            <h2 id="catalog-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Tu próxima gran idea empieza con un juego.</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PUZZLES.map((puzzle) => {
            const Icon = puzzle.icon;
            return (
              <Link key={puzzle.path} to={puzzle.path} className="group rounded-2xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_35px_-24px_rgba(139,101,197,0.4)] focus-visible:-translate-y-1">
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

      <section className="mcp-promo mb-12 grid gap-10 overflow-hidden rounded-3xl border border-brand-200 p-5 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12 lg:p-10" aria-labelledby="mcp-title">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Tu asistente + EduTools
          </div>
          <h2 id="mcp-title" className="mt-5 max-w-xl text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] text-[#282332] sm:text-4xl">
            Vos ponés la idea.<br /><span className="text-brand">Tu chat, el primer paso.</span>
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            Creá puzzles desde tu asistente de IA favorito. Conectalo a EduTools con MCP, pedile una actividad con tus palabras y recibí el enlace para jugar.
          </p>
          <ol className="mt-7 grid gap-4 text-sm text-slate-700">
            <li className="flex items-center gap-3"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-white font-mono text-xs font-semibold text-primary">01</span>Creá tu token de conexión.</li>
            <li className="flex items-center gap-3"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-white font-mono text-xs font-semibold text-primary">02</span>Conectá EduTools a tu asistente.</li>
            <li className="flex items-center gap-3"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-white font-mono text-xs font-semibold text-primary">03</span>Pedí un puzzle. Compartí el juego.</li>
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={integrationsHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md">
              {authStatus === "auth" ? "Configurar MCP" : authStatus === "anon" ? "Crear cuenta y conectar" : "Conectar MCP"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {authStatus === "anon" && <Link to="/iniciar-sesion" className="min-h-11 content-center text-sm font-semibold text-indigo-800 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-950">Ya tengo cuenta</Link>}
          </div>
          <p className="mt-5 flex max-w-sm items-start gap-2 text-xs leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Tu contraseña se queda con vos. Usás un token que podés revocar cuando quieras.</p>
        </div>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-[#352b49] bg-[#17131f] shadow-[0_18px_45px_-20px_#4c356b60]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#211a2c] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-[#c6afe2]" /><span className="h-2 w-2 rounded-full bg-[#8b65c5]" /><span className="h-2 w-2 rounded-full bg-[#518464]" /></div>
                <span className="flex items-center gap-2 font-mono text-[11px] text-[#c8bbda]"><Terminal className="h-3.5 w-3.5" aria-hidden="true" /> edutools / chat</span>
              </div>
              <span className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-[#bbaeC9]">DEMO</span>
            </div>
            <div className="space-y-6 p-4 sm:p-5" aria-label="Ejemplo de conversación con EduTools">
              <div className="ml-5 rounded-xl rounded-tr-sm border border-[#6f52924d] bg-[#342440] p-4">
                <p className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#c6afe2]"><MessageSquare className="h-3 w-3" aria-hidden="true" /> Vos</p>
                <p className="text-sm leading-relaxed text-[#f0e8f8]">Creá una sopa de letras de animales de granja con gallina, vaca, oveja y caballo. Guardala y pasame el enlace para jugar.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#bba0df40] bg-[#8b65c526] text-[#c6afe2]"><Bot className="h-4 w-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#c6afe2]">Tu asistente</p>
                  <p className="mt-1.5 text-sm text-[#e1d8eb]">¡Listo! Tu idea ya tiene forma de juego.</p>
                  <div className="mt-3 rounded-xl border border-[#51405f] bg-[#241d2d] p-4">
                    <p className="flex items-center gap-1.5 font-mono text-[10px] text-[#a9d6ba]"><Check className="h-3 w-3" aria-hidden="true" /> Actividad generada</p>
                    <p className="mt-2.5 font-bold text-[#f8f4fc]">Animales de granja</p>
                    <p className="mt-1 text-xs text-[#b5a8c4]">Sopa de letras · 4 palabras</p>
                    <p className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs font-medium text-[#d4baf6]"><Link2 className="h-3.5 w-3.5" aria-hidden="true" /> Enlace listo para compartir</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#211a2c] px-4 py-3">
              <span className="font-mono text-[10px] text-[#b9acc8]">Probalo en tu asistente</span>
              <button type="button" onClick={() => void handleCopyMcpPrompt()} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#ac8bd44d] bg-[#8b65c526] px-3 text-xs font-semibold text-[#e1d0f5] transition-colors hover:bg-[#8b65c540] focus-visible:outline-[#c6afe2]">
                {promptCopied ? <Check className="h-3.5 w-3.5 text-[#a9d6ba]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                {promptCopied ? "Copiado" : "Copiar prompt"}
              </button>
            </div>
          </div>
          <p aria-live="polite" className={`mt-3 min-h-5 text-[11px] leading-relaxed ${promptCopyError ? "text-red-700" : "text-slate-500"}`}>
            {promptCopyError ? "No se pudo copiar. Abrí el prompt de abajo para copiarlo manualmente." : promptCopied ? "Prompt copiado. Pegalo en tu asistente después de conectar EduTools." : "Conversación de ejemplo. Conectá tu cuenta para crear el tuyo."}
          </p>
          <details className="mt-1 text-xs text-primary">
            <summary className="inline-flex min-h-8 cursor-pointer items-center underline decoration-brand-200 underline-offset-4">Ver prompt completo</summary>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-brand-200 bg-white p-3 font-mono text-[11px] leading-relaxed text-slate-700">{MCP_PROMPT}</pre>
          </details>
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
