import { Link } from "react-router-dom";
import { Puzzle, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/60 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 no-underline"
        >
          <Puzzle className="w-4 h-4 text-indigo-600" />
          EduTools
        </Link>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          Generador de puzzles educativos para docentes.
          <span className="mx-1">·</span>
          Hecho con
          <Heart className="w-3 h-3 text-red-400" />
          por
          <a
            href="https://edualex.uy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 underline font-medium transition-colors"
          >
            EduAlex
          </a>
        </p>
      </div>
    </footer>
  );
}
