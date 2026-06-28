import { Link } from "react-router-dom";
import {
  LetterText,
  Crosshair,
  Zap,
  FileDown,
  Heart,
  ArrowRight,
  TextCursorInput,
  Shuffle,
  ListOrdered,
  Smartphone,
  Gamepad2,
  Link2,
  Layers,
  Bookmark,
  Share2,
  Puzzle,
} from "lucide-react";

const PUZZLES = [
  {
    path: "/sopa-de-letras",
    title: "Sopa de Letras",
    description:
      "Genera sopas de letras personalizadas. Ingresa palabras, elige el modo de presentacion y descarga el PDF listo para usar en clase.",
    icon: LetterText,
  },
  {
    path: "/crucigrama",
    title: "Crucigrama",
    description:
      "Crea crucigramas con pistas. Ideal para evaluaciones o actividades de refuerzo. Descarga el PDF con o sin solucionario.",
    icon: Crosshair,
  },
  {
    path: "/rellenar-huecos",
    title: "Rellenar Huecos",
    description:
      "Pega un texto y genera huecos aleatorios para que los estudiantes completen. Incluye distractores automaticos.",
    icon: TextCursorInput,
  },
  {
    path: "/adivina-la-palabra",
    title: "Adivina la Palabra",
    description:
      "Genera juegos de adivinar palabras con definiciones. Juego interactivo en linea y PDF para imprimir.",
    icon: Heart,
  },
  {
    path: "/anagrama",
    title: "Anagrama",
    description:
      "Crea anagramas con palabras y definiciones. Ordena las letras para formar la palabra correcta.",
    icon: Shuffle,
  },
  {
    path: "/ordenar-oracion",
    title: "Ordenar Oración",
    description:
      "Genera oraciones desordenadas para que los estudiantes las ordenen correctamente.",
    icon: ListOrdered,
  },
  {
    path: "/relacionar-columnas",
    title: "Relacionar Columnas",
    description:
      "Genera juegos de relacionar palabras con sus definiciones. Dos columnas para emparejar correctamente.",
    icon: Link2,
  },
  {
    path: "/memoria",
    title: "Memoria",
    description:
      "Genera juegos de memoria con pares de palabras y definiciones. Juega online o imprime las cards.",
    icon: Layers,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Rápido",
    description: "Genera puzzles en segundos, sin esperas.",
  },
  {
    icon: Bookmark,
    title: "Guarda tus puzzles",
    description: "Con una cuenta gratuita, conservá tus puzzles para reutilizarlos.",
  },
  {
    icon: FileDown,
    title: "Descarga en PDF",
    description: "Exportá listo para imprimir y usar en clase.",
  },
  {
    icon: Smartphone,
    title: "Jugar online",
    description: "Compartí un link para jugar desde cualquier dispositivo.",
  },
];

export default function HomePage() {
  return (
    <div className="py-12 sm:py-20 bg-pattern">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Generador de Puzzles
          <br />
          <span className="gradient-text">Educativos</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
          Creá puzzles educativos, imprimilos en PDF o compartilos como juegos interactivos.{" "}
          <span className="font-medium text-gray-700">100% gratis</span>, registro opcional para guardar tus puzzles.
        </p>
        <Link
          to="/sopa-de-letras"
          className="btn-primary inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-white font-medium no-underline text-sm"
        >
          Empezar ahora
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto mb-20 stagger-children">
        {PUZZLES.map((puzzle) => {
          const Icon = puzzle.icon;
          return (
            <Link
              key={puzzle.path}
              to={puzzle.path}
              className="card-hover group flex flex-col p-6 bg-white rounded-2xl border border-gray-200 no-underline"
            >
              <div className="card-icon w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {puzzle.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                {puzzle.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600">
                Crear puzzle
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto mb-20">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-50 to-white border border-indigo-200 p-8 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
              <Gamepad2 className="w-4 h-4" />
              <span>Puzzles digitales</span>
            </div>
            <span className="animate-beta-pulse px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              BETA
            </span>
            <Link
              to="/mis-puzzles"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors no-underline"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Guarda tus puzzles
            </Link>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Puzzles Digitales para Jugar
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl">
            Compartí un link con tus estudiantes y permití que jueguen desde su celular o computadora. Sin instalar nada.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/jugar"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium no-underline text-sm"
            >
              <Smartphone className="w-4 h-4" />
              Ver demostración
            </Link>
            <span className="text-xs text-gray-400">
              Función en desarrollo · Puede contener errores
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
          ¿Cómo funciona?
        </h2>
        <div className="grid sm:grid-cols-3 gap-5 stagger-children">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
              <Puzzle className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              1. Generá
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Elegí el tipo de puzzle y completá los datos. Todo en segundos.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
              <Bookmark className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              2. Guardá
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Con tu cuenta gratuita, conservá el puzzle para volver cuando quieras.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              3. Compartí
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Enviá el link o descargá el PDF listo para imprimir y usar en clase.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
          ¿Por qué EduTools?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 stagger-children">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
