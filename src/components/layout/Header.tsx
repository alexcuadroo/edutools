import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Puzzle, Search, Grid3X3, Menu, X, TextCursorInput, Heart, Shuffle, ChevronDown, LayoutGrid, ListOrdered } from "lucide-react";

const TABS = [
  { path: "/sopa-de-letras", label: "Sopa de Letras", icon: Search },
  { path: "/crucigrama", label: "Crucigrama", icon: Grid3X3 },
  { path: "/rellenar-huecos", label: "Rellenar Huecos", icon: TextCursorInput },
  { path: "/adivina-la-palabra", label: "Adivina la Palabra", icon: Heart },
  { path: "/anagrama", label: "Anagrama", icon: Shuffle },
  { path: "/ordenar-oracion", label: "Ordenar Oracion", icon: ListOrdered },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [puzzlesOpen, setPuzzlesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closePuzzles = useCallback(() => setPuzzlesOpen(false), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!puzzlesOpen) return;

    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closePuzzles();
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePuzzles();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [puzzlesOpen, closePuzzles]);

  const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.path));

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900 no-underline hover:opacity-80 transition-opacity"
          >
            <Puzzle className="w-6 h-6 text-indigo-600" />
            EduTools
          </Link>

          <div className="hidden sm:flex items-center gap-2 relative" ref={dropdownRef}>
            <button
              onClick={() => setPuzzlesOpen((v) => !v)}
              aria-expanded={puzzlesOpen}
              aria-haspopup="true"
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all ${
                activeTab
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Puzzles
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${puzzlesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {puzzlesOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-100 z-50 py-2"
              >
                <div className="grid grid-cols-2 gap-1 px-2">
                  {TABS.map((tab) => {
                    const isActive = location.pathname.startsWith(tab.path);
                    const Icon = tab.icon;
                    return (
                      <Link
                        key={tab.path}
                        to={tab.path}
                        onClick={closePuzzles}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {tab.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[100] sm:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <nav
          className={`absolute top-0 right-0 h-full w-64 bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-lg font-bold text-gray-900 no-underline"
            >
              <Puzzle className="w-6 h-6 text-indigo-600" />
              EduTools
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-1">
            {TABS.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all no-underline ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
