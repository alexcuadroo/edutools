import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

interface AuthState {
  user: User | null;
  status: "loading" | "anon" | "auth";
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (confirmEmail: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",

  checkSession: async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, status: "auth" });
      } else {
        set({ user: null, status: "anon" });
      }
    } catch {
      set({ user: null, status: "anon" });
    }
  },

  login: async (email, password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({ error: "Error desconocido" }));

    if (response.ok) {
      set({ user: data.user, status: "auth" });
      return;
    }

    if (response.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
      throw new Error("Verificá tu email antes de iniciar sesión");
    }
    if (response.status === 429) {
      throw new Error("Demasiados intentos. Intentá de nuevo más tarde.");
    }
    throw new Error(data.error || "Email o contraseña incorrectos");
  },

  signup: async (email, password, displayName) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Error desconocido" }));
      if (response.status === 409) {
        throw new Error("Ya existe una cuenta con este email");
      }
      if (response.status === 429) {
        throw new Error("Demasiados intentos. Intentá de nuevo más tarde.");
      }
      throw new Error(error.error || "Error al crear la cuenta");
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null, status: "anon" });
  },

  deleteAccount: async (confirmEmail) => {
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: confirmEmail }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Error desconocido" }));
      if (response.status === 429) {
        throw new Error("Demasiados intentos. Intentá de nuevo más tarde.");
      }
      throw new Error(error.error || "Error al eliminar la cuenta");
    }

    set({ user: null, status: "anon" });
  },
}));
