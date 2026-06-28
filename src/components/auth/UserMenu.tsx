import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { LogOut, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import DeleteAccountModal from "@/components/auth/DeleteAccountModal";

interface UserMenuProps {
  variant?: "desktop" | "mobile";
}

export default function UserMenu({ variant = "desktop" }: UserMenuProps) {
  const { user, status, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast.success("Sesión cerrada");
    } catch {
      toast.error("Error al cerrar sesión");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (status === "anon") {
    if (variant === "mobile") {
      return (
        <Link
          to="/iniciar-sesion"
          onClick={() => setOpen(false)}
          className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Iniciar sesión
        </Link>
      );
    }
    return (
      <Link
        to="/iniciar-sesion"
        className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Iniciar sesión
      </Link>
    );
  }

  if (!user) return null;

  const initial = (user.displayName || user.email).charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <Link
            to="/mis-puzzles"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Mis puzzles
          </Link>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Cerrar sesión
          </button>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => {
              setOpen(false);
              setDeleteOpen(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar cuenta
          </button>
        </div>
      )}

      {deleteOpen && <DeleteAccountModal onClose={() => setDeleteOpen(false)} />}
    </div>
  );
}
