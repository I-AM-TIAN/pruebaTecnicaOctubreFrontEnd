import { setTokens, clearTokens as clearApiTokens } from './api-client';
import { authService } from './api-services';
import type { LoginCredentials, LoginResponse, AuthProfile } from '@/types';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const raw = await authService.login(credentials) as any;

  let payload: any = raw;
  if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;
  if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;

  const accessToken: string | undefined = payload?.accessToken ?? raw?.accessToken;
  const refreshToken: string | undefined = payload?.refreshToken ?? raw?.refreshToken;
  const user = payload?.user ?? raw?.user;

  if (accessToken && refreshToken) {
    setTokens({ accessToken, refreshToken });
  } else {
    const at = payload?.data?.accessToken ?? raw?.data?.accessToken;
    const rt = payload?.data?.refreshToken ?? raw?.data?.refreshToken;
    if (at && rt) setTokens({ accessToken: at, refreshToken: rt });
  }

  const result: LoginResponse = {
    accessToken: accessToken ?? (raw as any).accessToken ?? '',
    refreshToken: refreshToken ?? (raw as any).refreshToken ?? '',
    user: user,
  } as any;

  return result;
}

export async function getProfile(): Promise<AuthProfile> {
  return authService.getProfile();
}

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

export function clearTokens(): void {
  clearApiTokens();
}
