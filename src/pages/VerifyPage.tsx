import { useSearchParams, Link } from "react-router-dom";
import { useNoIndexMeta } from "@/hooks/useNoIndexMeta";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const ok = searchParams.get("ok");

  useNoIndexMeta("Verificar cuenta");

  if (ok === "1") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cuenta verificada</h1>
        <p className="text-gray-600 mb-6">Tu cuenta ha sido verificada exitosamente.</p>
        <Link
          to="/iniciar-sesion"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (ok === "0") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de verificación</h1>
        <p className="text-gray-600 mb-6">
          El link de verificación es inválido o ha expirado.
        </p>
        <Link
          to="/crear-cuenta"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Crear nueva cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisá tu email</h1>
      <p className="text-gray-600 mb-6">
        Te enviamos un email de verificación. Revisá tu bandeja de entrada y hacé click en el link para activar tu cuenta.
      </p>
      <p className="text-sm text-gray-500">
        Si no ves el email, revisá la carpeta de spam.
      </p>
    </div>
  );
}
