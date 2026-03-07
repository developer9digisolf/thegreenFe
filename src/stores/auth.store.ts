import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '@afx/interfaces/auth.iface';

interface IAuthStore {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<IUser>) => void;
}

/**
 * Authentication store using Zustand with persistence
 * This store is persisted to localStorage for better UX
 */
export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'thegreen-auth-storage',
    }
  )
);
