import { create } from 'zustand';
import type { AuthProfile, Role } from '@/types';

interface AuthState {
  user: AuthProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false,
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false,
    isLoading: false,
  }),
  
  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },
}));
