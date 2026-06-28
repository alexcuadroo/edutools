import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNoIndexMeta } from "@/hooks/useNoIndexMeta";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { user, status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useNoIndexMeta("Iniciar sesión");

  useEffect(() => {
    if (status === "auth" && user) {
      navigate("/");
    }
  }, [status, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setResent(false);
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Sesión iniciada");
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      if (message.includes("Verificá tu email")) {
        setUnverifiedEmail(email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      if (response.ok) {
        setResent(true);
        toast.success("Email de verificación enviado");
      } else {
        toast.error("Error al enviar el email");
      }
    } catch {
      toast.error("Error al enviar el email");
    } finally {
      setResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Iniciar sesión</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      {unverifiedEmail && !resent && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 mb-2">
            Tu cuenta no está verificada. Revisá tu email o reenviá el link de verificación.
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="cursor-pointer text-sm font-medium text-amber-900 hover:text-amber-700 underline disabled:opacity-50"
          >
            {resending ? "Enviando..." : "Reenviar email de verificación"}
          </button>
        </div>
      )}

      {resent && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Te enviamos un nuevo email de verificación. Revisá tu bandeja de entrada.
        </div>
      )}

      <div className="mt-6 text-center space-y-2">
        <Link to="/recuperar-cuenta" className="text-sm text-indigo-600 hover:text-indigo-700">
          ¿Olvidaste tu contraseña?
        </Link>
        <p className="text-sm text-gray-600">
          ¿No tenés cuenta?{" "}
          <Link to="/crear-cuenta" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
