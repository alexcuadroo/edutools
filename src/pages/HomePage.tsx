import { Link } from "react-router-dom";
import {
  LetterText,
  Crosshair,
  Zap,
  Lock,
  FileDown,
  Heart,
  ArrowRight,
  TextCursorInput,
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
];

const FEATURES = [
  {
    icon: Zap,
    title: "Rápido",
    description: "Genera puzzles en segundos, sin esperas.",
  },
  {
    icon: Lock,
    title: "Sin registro",
    description: "Usa la herramienta directamente, sin crear cuenta.",
  },
  {
    icon: FileDown,
    title: "Descarga en PDF",
    description: "Exporta listo para imprimir y usar en clase.",
  },
  {
    icon: Heart,
    title: "Gratuito",
    description: "Sin límites de uso, sin costos ocultos.",
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
          Crea sopas de letras, crucigramas, textos con huecos, ahorcado y mas en segundos. Sin
          registro, sin limites.
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
