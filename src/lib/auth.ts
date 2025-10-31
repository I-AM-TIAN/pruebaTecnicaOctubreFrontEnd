import { setTokens, clearTokens as clearApiTokens } from './api-client';
import { authService } from './api-services';
import type { LoginCredentials, LoginResponse, AuthProfile } from '@/types';

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await authService.login(credentials);

  // Store tokens
  setTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  return response;
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
