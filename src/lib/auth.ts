import { setTokens, clearTokens as clearApiTokens } from './api-client';
import { authService } from './api-services';
import type { LoginCredentials, LoginResponse, AuthProfile } from '@/types';

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // The backend (and some HTTP clients like Axios) may wrap the real
  // payload inside one or more `data` properties. Example observed:
  // {
  //   path: '/api/auth/login',
  //   method: 'POST',
  //   data: {
  //     user: { ... },
  //     accessToken: '...',
  //     refreshToken: '...'
  //   }
  // }
  // Normalize all those cases so login() always returns { user, accessToken, refreshToken }.
  const raw = await authService.login(credentials) as any;

  // Unwrap multiple layers of `data` if present (handles axios-like wrapping)
  let payload: any = raw;
  // Unwrap up to two levels (data, data.data). This is defensive and covers
  // the common cases without making assumptions about deeper nesting.
  if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;
  if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;

  const accessToken: string | undefined = payload?.accessToken ?? raw?.accessToken;
  const refreshToken: string | undefined = payload?.refreshToken ?? raw?.refreshToken;
  const user = payload?.user ?? raw?.user;

  // Store tokens if available (setTokens expects both strings or null)
  if (accessToken && refreshToken) {
    setTokens({ accessToken, refreshToken });
  } else {
    // If backend uses different field names, try common alternatives
    const at = payload?.data?.accessToken ?? raw?.data?.accessToken;
    const rt = payload?.data?.refreshToken ?? raw?.data?.refreshToken;
    if (at && rt) setTokens({ accessToken: at, refreshToken: rt });
  }

  // Build a LoginResponse-shaped object to return
  const result: LoginResponse = {
    accessToken: accessToken ?? (raw as any).accessToken ?? '',
    refreshToken: refreshToken ?? (raw as any).refreshToken ?? '',
    user: user,
  } as any;

  return result;
}

/**
 * Get authenticated user profile
 */
export async function getProfile(): Promise<AuthProfile> {
  return authService.getProfile();
}

/**
 * Logout and clear session
 */
export async function logout(): Promise<void> {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearApiTokens();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

/**
 * Clear stored tokens
 */
export function clearTokens(): void {
  clearApiTokens();
}
