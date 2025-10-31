import { useAuthStore } from '@/store/auth-store';
import type { Role } from '@/types';

/**
 * Custom hook for authentication operations
 * Provides clean access to auth state and role checking
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isDoctor = (): boolean => {
    return user?.role === 'doctor';
  };

  const isPatient = (): boolean => {
    return user?.role === 'patient';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isDoctor,
    isPatient,
  };
}
