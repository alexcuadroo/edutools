import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <p className="text-6xl font-bold text-gray-300 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 mb-6">La página que buscas no existe.</p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors no-underline"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
