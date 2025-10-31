'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { getProfile } from '@/lib/auth';
import { getTokens } from '@/lib/api-client';

interface AuthContextValue {
  // This can be extended if needed
}

const AuthContext = createContext<AuthContextValue>({});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading, user } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // Skip initialization if user is already set (e.g., from login)
      if (user) {
        console.log('AuthProvider: User already set:', user);
        setLoading(false);
        return;
      }

      try {
        const tokens = getTokens();
        console.log('AuthProvider: Tokens found:', !!tokens);
        
        if (tokens) {
          console.log('AuthProvider: Fetching profile...');
          const profile = await getProfile();
          console.log('AuthProvider: Profile loaded:', profile);
          setUser(profile);
        } else {
          console.log('AuthProvider: No tokens, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading, user]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
