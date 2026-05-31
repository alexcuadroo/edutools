import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
        <FileQuestion className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-5xl font-bold text-gray-200 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Página no encontrada
      </h1>
      <p className="text-gray-500 mb-8">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors no-underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
    </div>
  );
}
