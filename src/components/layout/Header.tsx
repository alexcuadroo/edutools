import { Link, useLocation } from "react-router-dom";

const TABS = [
  { path: "/sopa-de-letras", label: "Sopa de Letras" },
  { path: "/crucigrama", label: "Crucigrama" },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-indigo-600 no-underline">
          EduTools
        </Link>
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline ${
                location.pathname.startsWith(tab.path)
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
