import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { LogOut, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import DeleteAccountModal from "@/components/auth/DeleteAccountModal";

interface UserMenuProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UserMenu({ variant = "desktop", onNavigate, open, onOpenChange }: UserMenuProps) {
  const { user, status, logout } = useAuth();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const ref = useClickOutside<HTMLDivElement>(open === undefined && isOpen, () => setOpen(false));

  const handleLogout = async () => {
    onNavigate?.();
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
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted">
        <Loader2 className="h-4 w-4 animate-spin text-muted-subtle" />
      </div>
    );
  }

  if (status === "anon") {
    if (variant === "mobile") {
      return (
        <Link
          to="/iniciar-sesion"
          onClick={onNavigate}
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Iniciar sesión
        </Link>
      );
    }
    return (
      <Link
        to="/iniciar-sesion"
        className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Iniciar sesión
      </Link>
    );
  }

  if (!user) return null;

  const initial = (user.displayName || user.email).charAt(0).toUpperCase();

  if (variant === "mobile") {
    return (
      <section className="border-t border-gray-200 pt-4" aria-label="Cuenta">
        <div className="flex items-center gap-3 px-1">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white" aria-hidden="true">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">{user.displayName || user.email}</p>
            {user.displayName && <p className="truncate text-xs text-gray-500">{user.email}</p>}
          </div>
        </div>

        <div className="mt-3 grid gap-1">
          <Link
            to="/mis-puzzles"
            onClick={onNavigate}
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <FolderOpen className="h-4 w-4 text-gray-500" aria-hidden="true" />
            Mis puzzles
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loading}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4 text-gray-500" aria-hidden="true" />}
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              setDeleteOpen(true);
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-700 transition-colors hover:bg-danger-subtle"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Eliminar cuenta
          </button>
        </div>

        {deleteOpen && <DeleteAccountModal onClose={() => setDeleteOpen(false)} />}
      </section>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        aria-label="Abrir menú de usuario"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        {initial}
      </button>

      {isOpen && (
        <div role="menu" aria-label="Menú de usuario" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-surface py-2 shadow-[var(--shadow-card)]">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.displayName || user.email}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          <Link
            to="/mis-puzzles"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex min-h-10 items-center gap-2 px-4 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <FolderOpen className="w-4 h-4" />
            Mis puzzles
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            disabled={loading}
            className="flex min-h-10 w-full cursor-pointer items-center gap-2 px-4 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Cerrar sesión
          </button>

          <div className="my-1 border-t border-border" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setDeleteOpen(true);
            }}
            role="menuitem"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-danger-subtle transition-colors cursor-pointer"
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
