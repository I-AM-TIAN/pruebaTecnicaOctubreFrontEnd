import type { Role, AuthProfile } from '@/types';

/**
 * Verifica si el usuario tiene el rol requerido
 */
export function hasRole(user: AuthProfile | null, role: Role): boolean {
  return user?.role === role;
}

/**
 * Verifica si el usuario tiene alguno de los roles permitidos
 */
export function hasAnyRole(user: AuthProfile | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Verifica si hay una sesión activa
 */
export function isAuthenticated(user: AuthProfile | null): boolean {
  return user !== null;
}

/**
 * Obtiene la ruta por defecto según el rol del usuario
 */
export function getDefaultRouteByRole(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'doctor':
      return '/doctor/prescriptions';
    case 'patient':
      return '/patient/prescriptions';
    default:
      return '/login';
  }
}

/**
 * Verifica si el usuario puede acceder a una ruta específica
 */
export function canAccessRoute(user: AuthProfile | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
