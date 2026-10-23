import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, Copy, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { useNoIndexMeta } from "@/hooks/useNoIndexMeta";

interface McpToken {
  id: string;
  name: string;
  createdAt: number;
}

interface CreatedToken extends McpToken {
  token: string;
}

export default function IntegrationsPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<McpToken[]>([]);
  const [name, setName] = useState("Mi conexión MCP");
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useNoIndexMeta("Integraciones MCP");

  const loadTokens = useCallback(async () => {
    try {
      const response = await fetch("/api/mcp-tokens");
      if (!response.ok) throw new Error("No se pudieron cargar los tokens");
      setTokens(await response.json() as McpToken[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar tokens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "anon") {
      navigate("/iniciar-sesion");
    } else if (status === "auth") {
      const timer = window.setTimeout(() => void loadTokens(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [status, navigate, loadTokens]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreatedToken(null);
    try {
      const response = await fetch("/api/mcp-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "No se pudo crear el token");
      setCreatedToken({ ...body.tokenInfo, token: body.token });
      setTokens((current) => [body.tokenInfo, ...current]);
      toast.success("Token creado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear token");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (token: McpToken) => {
    setRevoking(token.id);
    try {
      const response = await fetch(`/api/mcp-tokens/${token.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo revocar el token");
      }
      setTokens((current) => current.filter((item) => item.id !== token.id));
      if (createdToken?.id === token.id) setCreatedToken(null);
      toast.success("Token revocado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al revocar token");
    } finally {
      setRevoking(null);
    }
  };

  const copyToken = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken.token);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Seleccioná el token y copialo manualmente.");
    }
  };

  if (status === "loading" || status === "anon") {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>;
  }

  const mcpUrl = `${window.location.origin}/api/mcp`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-7">
        <p className="text-sm font-medium text-indigo-700">Conexiones</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">Conectar con MCP</h1>
        <p className="mt-2 text-sm text-gray-600">
          Conectá un cliente LLM a EduTools para guardar puzzles en tu cuenta y recibir el enlace para jugar.
        </p>
      </div>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Servidor MCP</h2>
        <p className="mt-1 text-sm text-gray-600">Usá esta dirección en un cliente MCP compatible con Streamable HTTP y encabezados personalizados.</p>
        <code className="mt-3 block break-all rounded-lg bg-gray-50 p-3 text-sm text-gray-800">{mcpUrl}</code>
        <p className="mt-3 text-xs text-gray-500">Autenticación: encabezado <code>Authorization: Bearer TU_TOKEN</code>. El token da acceso a guardar puzzles en tu cuenta; no lo compartas.</p>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Crear token</h2>
        <p className="mt-1 text-sm text-gray-600">El token se muestra una sola vez. Podés tener hasta 5 tokens activos.</p>
        <form onSubmit={(event) => void handleCreate(event)} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="mcp-token-name">Nombre de la conexión</label>
          <input
            id="mcp-token-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            required
            className="min-h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Ej. Claude en mi portátil"
          />
          <button
            type="submit"
            disabled={creating || tokens.length >= 5}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear token
          </button>
        </form>

        {createdToken && (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-950">Copiá y guardá el token ahora</p>
                <p className="mt-1 text-sm text-amber-900">No podremos volver a mostrarlo. Si lo perdés, revocalo y creá uno nuevo.</p>
                <code className="mt-3 block break-all rounded-lg border border-amber-200 bg-white p-3 text-sm text-gray-900">{createdToken.token}</code>
                <button type="button" onClick={() => void copyToken()} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-400 bg-white px-3 text-sm font-medium text-amber-950 hover:bg-amber-100">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar token"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><KeyRound className="h-5 w-5 text-indigo-600" />Tokens activos</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>
        ) : tokens.length === 0 ? (
          <p className="py-6 text-sm text-gray-600">Todavía no creaste tokens.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {tokens.map((token) => (
              <li key={token.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-gray-900">{token.name}</p>
                  <p className="text-xs text-gray-500">Creado el {new Date(token.createdAt).toLocaleDateString("es-UY")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRevoke(token)}
                  disabled={revoking === token.id}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {revoking === token.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Revocar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <h2 className="font-semibold text-indigo-950">Herramienta disponible</h2>
        <p className="mt-1 text-sm text-indigo-900"><code>save_puzzle</code> recibe las palabras, pistas o el texto original; los generadores de EduTools construyen el puzzle en el servidor, lo guardan en tu cuenta y devuelven el enlace de juego. El cliente debe permitir configurar el encabezado Authorization.</p>
      </section>
    </main>
  );
}
