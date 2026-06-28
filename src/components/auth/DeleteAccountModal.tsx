import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { user, deleteAccount } = useAuth();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAccount(confirmEmail);
      toast.success("Cuenta eliminada");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModal
      open
      onClose={onClose}
      title="Eliminar cuenta"
      ariaLabel="Eliminar cuenta"
      description={
        <span className="inline-flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Acción irreversible
        </span>
      }
      confirmLabel={loading ? "Eliminando..." : "Eliminar cuenta"}
      tone="danger"
      onConfirm={handleDelete}
      loading={loading}
      disabled={confirmEmail !== user?.email}
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Se borrarán tu cuenta, tus puzzles guardados y todas tus sesiones.
          Los puzzles que compartiste seguirán disponibles hasta que expiren (24hs).
        </p>
        <div>
          <label htmlFor="confirm-email" className="block text-sm font-medium text-gray-700 mb-1">
            Escribí <span className="font-mono font-semibold">{user?.email}</span> para confirmar
          </label>
          <input
            id="confirm-email"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            disabled={loading}
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>
    </ConfirmModal>
  );
}