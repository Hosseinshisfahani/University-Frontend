import { create } from "zustand";
import type { User } from "./types";

/**
 * Non-sensitive session state only.
 * Access/refresh tokens live exclusively in HttpOnly cookies and must
 * NEVER be stored here, in LocalStorage, or in SessionStorage.
 */
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  clearSession: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
