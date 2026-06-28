import { useState } from "react";
import { Link } from "react-router-dom";
import { useNoIndexMeta } from "@/hooks/useNoIndexMeta";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useNoIndexMeta("Recuperar contraseña");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el email");
      }

      setSent(true);
      toast.success("Si el email existe, te enviamos un link");
    } catch {
      toast.error("Error al enviar el email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email enviado</h1>
        <p className="text-gray-600 mb-6">
          Si el email existe en nuestro sistema, te enviamos un link para restablecer tu contraseña.
        </p>
        <Link
          to="/iniciar-sesion"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Recuperar contraseña</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Enviando..." : "Enviar link de recuperación"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/iniciar-sesion" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
