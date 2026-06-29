import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'vendedor';
  empresa_id: number | null;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      isAdmin: () => get().user?.rol === 'admin',
    }),
    {
      name: 'crm-w-group-auth',
    }
  )
);
