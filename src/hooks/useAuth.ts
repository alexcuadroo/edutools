import { useAuthStore } from "@/store/auth-store";
import { useShallow } from "zustand/react/shallow";

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      status: state.status,
      login: state.login,
      signup: state.signup,
      logout: state.logout,
      deleteAccount: state.deleteAccount,
      checkSession: state.checkSession,
    }))
  );
}
