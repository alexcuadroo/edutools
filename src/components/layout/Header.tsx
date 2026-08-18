import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Puzzle, Search, Grid3X3, Menu, X, TextCursorInput, Heart, Shuffle, ChevronDown, LayoutGrid, ListOrdered, Play, Link2, Layers, CircleHelp, Keyboard } from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";

const TABS = [
  { path: "/sopa-de-letras", label: "Sopa de Letras", icon: Search },
  { path: "/crucigrama", label: "Crucigrama", icon: Grid3X3 },
  { path: "/rellenar-huecos", label: "Rellenar Huecos", icon: TextCursorInput },
  { path: "/adivina-la-palabra", label: "Adivina la Palabra", icon: Heart },
  { path: "/anagrama", label: "Anagrama", icon: Shuffle },
  { path: "/ordenar-oracion", label: "Ordenar Oración", icon: ListOrdered },
  { path: "/relacionar-columnas", label: "Relacionar Columnas", icon: Link2 },
  { path: "/memoria", label: "Memoria", icon: Layers },
  { path: "/rosco", label: "Rosco", icon: CircleHelp },
  { path: "/cadenas-de-palabras", label: "Cadenas de Palabras", icon: Keyboard },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [activePopover, setActivePopover] = useState<"puzzles" | "user" | null>(null);
  const dropdownRef = useClickOutside<HTMLDivElement>(activePopover !== null, () => setActivePopover(null));
  const closePopovers = useCallback(() => setActivePopover(null), []);

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
    if (!mobileOpen) return;
    mobileDrawerRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.path));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-extrabold text-foreground no-underline hover:opacity-80 transition-opacity"
          >
            <Puzzle className="w-6 h-6 text-indigo-600" />
            EduTools
          </Link>

          <div className="hidden sm:flex items-center gap-2 relative" ref={dropdownRef}>
            <Link
              to="/jugar"
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary bg-surface px-3 py-2 text-sm font-semibold text-primary no-underline shadow-sm transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <Play className="w-4 h-4" />
              Jugar
            </Link>
            <button
              type="button"
              onClick={() => setActivePopover((current) => current === "puzzles" ? null : "puzzles")}
              aria-expanded={activePopover === "puzzles"}
              aria-haspopup="true"
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all ${
                activeTab
                  ? "bg-primary-subtle text-primary"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Puzzles
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${activePopover === "puzzles" ? "rotate-180" : ""}`}
              />
            </button>

            {activePopover === "puzzles" && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-[30rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface py-2 shadow-[var(--shadow-card)]"
              >
                <div className="grid grid-cols-2 gap-1 px-2">
                  {TABS.map((tab) => {
                    const isActive = location.pathname.startsWith(tab.path);
                    const Icon = tab.icon;
                    return (
                      <Link
                        key={tab.path}
                        to={tab.path}
                        onClick={closePopovers}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-2.5 whitespace-nowrap px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${
                          isActive
                            ? "bg-primary-subtle text-primary"
                            : "text-muted hover:bg-surface-muted hover:text-foreground"
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

            <ThemeToggle className="min-h-9 min-w-9 rounded-lg" />
            <UserMenu open={activePopover === "user"} onOpenChange={(open) => setActivePopover(open ? "user" : null)} />
          </div>

          <button
            ref={mobileTriggerRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 sm:hidden"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-100 sm:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />

        <nav
          ref={mobileDrawerRef}
          id="mobile-navigation"
          tabIndex={-1}
          aria-label="Navegación principal"
          aria-modal="true"
          className={`absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-lg font-bold text-gray-900 no-underline"
            >
              <Puzzle className="w-6 h-6 text-indigo-600" />
              EduTools
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle className="min-h-11 min-w-11 border-0 bg-transparent" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-4">
            <div className="space-y-1">
            <Link
              to="/jugar"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-lg border border-indigo-600 bg-white px-4 py-3 text-base font-semibold text-indigo-700 no-underline transition-colors hover:bg-indigo-600 hover:text-white"
            >
              <Play className="w-5 h-5" />
              Jugar
            </Link>

            <div className="border-t border-gray-100 my-2" />

            {TABS.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium no-underline transition-colors ${
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

            <div className="mt-3">
              <UserMenu variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
