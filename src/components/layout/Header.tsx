import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Puzzle, Search, Grid3X3, Menu, X } from "lucide-react";

const TABS = [
  { path: "/sopa-de-letras", label: "Sopa de Letras", icon: Search },
  { path: "/crucigrama", label: "Crucigrama", icon: Grid3X3 },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold text-gray-900 no-underline"
        >
          <Puzzle className="w-6 h-6 text-indigo-600" />
          EduTools
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden sm:flex gap-1"
        >
          {TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="sm:hidden border-t border-gray-100 bg-white px-4 py-2 space-y-1">
          {TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
