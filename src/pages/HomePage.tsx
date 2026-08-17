import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleHelp,
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
} from "lucide-react";
import { loadPuzzle } from "@/lib/share/api";
import { PUZZLE_TYPE_TO_SLUG } from "@/lib/puzzles/slugs";
import type { PlayablePuzzleType } from "@/lib/share/types";

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
];

export default function HomePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      <section className="home-hero relative overflow-hidden rounded-3xl border border-indigo-100 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12" aria-labelledby="home-title">
        <div className="landing-orb pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" aria-hidden="true" />
        <div className="landing-orb pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 id="home-title" className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Aprender jugando empieza acá.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            Elegí cómo querés continuar: jugá una actividad que te compartieron o creá una nueva para tu clase.
          </p>
        </div>

        <div className="relative mx-auto mt-8 grid max-w-4xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="student-entry rounded-2xl bg-indigo-700 p-5 text-white sm:p-7" aria-labelledby="student-title">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"><Gamepad2 className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <p className="text-sm font-semibold text-indigo-100">Para estudiantes</p>
                <h2 id="student-title" className="mt-1 text-2xl font-bold">¿Tenés un código?</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-indigo-100">Pegalo acá y entrá directo a tu puzzle. No necesitás cuenta.</p>
            <form className="mt-5" onSubmit={handlePlay} noValidate>
              <label htmlFor="home-puzzle-code" className="sr-only">Código del puzzle</label>
              <div className="flex flex-col gap-2 sm:flex-row">
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
                  className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-transparent bg-surface px-4 text-center font-mono text-base font-bold tracking-[0.14em] text-foreground outline-none placeholder:text-xs placeholder:font-semibold placeholder:tracking-normal placeholder:text-muted-subtle focus:border-indigo-200 disabled:opacity-60 sm:text-left"
                />
                <button type="submit" disabled={loading} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-bold text-amber-950 shadow-sm transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando…</> : <>Jugar <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
                </button>
              </div>
              <p id="home-code-help" className="mt-2 text-xs text-indigo-100">El código tiene 8 caracteres. Si tenés un enlace, abrilo directamente.</p>
              {error && <p id="home-code-error" role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-950/25 p-2.5 text-sm text-white"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}</p>}
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7" aria-labelledby="teacher-title">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><BookOpenCheck className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Para docentes</p>
                <h2 id="teacher-title" className="mt-1 text-2xl font-bold text-slate-950">Creá una actividad</h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">Generá, imprimí o compartí puzzles para tu grupo. Guardar es opcional.</p>
            <a href="#actividades" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 no-underline shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800">
              Crear un puzzle <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </section>
        </div>
      </section>

      <section id="actividades" className="mx-auto max-w-5xl scroll-mt-24 py-14 sm:py-20" aria-labelledby="catalog-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Para docentes</p>
            <h2 id="catalog-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Elegí el tipo de actividad</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600">Creá una actividad, compartila con un código o descargala para imprimir.</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PUZZLES.map((puzzle) => {
            const Icon = puzzle.icon;
            return (
              <Link key={puzzle.path} to={puzzle.path} className="group rounded-2xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
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
          <li className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-400 font-bold text-slate-950">1</span><h3 className="mt-4 font-semibold">Creá</h3><p className="mt-1 text-sm leading-relaxed text-slate-300">Elegí un formato y cargá el contenido de tu clase.</p></li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-400 font-bold text-slate-950">2</span><h3 className="mt-4 font-semibold">Compartí</h3><p className="mt-1 text-sm leading-relaxed text-slate-300">Enviá un enlace o el código de ocho caracteres.</p></li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-400 font-bold text-slate-950">3</span><h3 className="mt-4 font-semibold">Jugá</h3><p className="mt-1 text-sm leading-relaxed text-slate-300">El estudiante entra desde arriba, sin crear una cuenta.</p></li>
        </ol>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Sin instalar nada</span><span className="inline-flex items-center gap-2"><FileDown className="h-4 w-4 text-emerald-300" aria-hidden="true" /> PDF listo para imprimir</span><span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Enlace para compartir</span></div>
      </section>
    </div>
  );
}
