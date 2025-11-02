import type { AuthTokens } from '@/types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'http://localhost:4001';

let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage on load
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

export const setTokens = (tokens: AuthTokens | null) => {
  if (tokens) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    console.log('Tokens stored:', { accessToken: '***', refreshToken: '***' });
  } else {
    accessToken = null;
    refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    console.log('Tokens cleared');
  }
};

export const getTokens = (): AuthTokens | null => {
  if (typeof window !== 'undefined') {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    
    if (access && refresh) {
      accessToken = access;
      refreshToken = refresh;
      return { accessToken: access, refreshToken: refresh };
    }
  }
  
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
};

export const clearTokens = () => {
  setTokens(null);
};

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const tokens = getTokens();
    if (!tokens?.refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearTokens();
    return false;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Debug info in development: do not print raw tokens
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
      console.debug('apiClient -> request', {
        url,
        method: (fetchOptions.method || 'GET').toString(),
        hasAuth: !!headers['Authorization'],
      });
    } catch (e) {
      // swallow any debug error
    }
  }

  // Add authorization header if not skipped
  if (!skipAuth) {
    const tokens = getTokens();
    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
  }

  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Debug response info (dev only)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
      console.debug('apiClient -> response status', { url, status: response.status });
    } catch (e) {}
  }

  // Handle 401 - Try to refresh token
  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      // Retry the request with new token
      const tokens = getTokens();
      if (tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } else {
      // Refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error: any = new Error('API request failed');
    try {
      const errorData = await response.json();
      // In dev, log backend error payload for debugging (do not leak tokens)
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        try { console.debug('apiClient -> error payload', { url, status: response.status, errorData }); } catch (e) {}
      }

      error.message = errorData.message || error.message;
      error.status = response.status;
      error.data = errorData;
    } catch {
      error.status = response.status;
      error.message = response.statusText;
    }
    throw error;
  }

  // Handle responses without body
  const contentType = response.headers.get('content-type');
  // If response is JSON, parse and defensively unwrap common wrappers like
  // { data: { ... } } or { data: { data: { ... } } } so callers always receive
  // the inner payload directly. This centralizes handling of axios/back-end
  // wrappers and avoids repeating unwrapping logic in every service.
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    let payload: any = data;

    // Unwrap a single top-level `data` wrapper. Many backends return
    // { data: { ... } } (or Axios returns res.data). Unwrapping only one
    // level ensures we don't accidentally strip nested structures like
    // { data: { data: [...], meta: {...} } } which would remove `meta` if
    // unwrapped twice.
    if (payload && typeof payload === 'object' && 'data' in payload) {
      payload = payload.data;
    }

    return payload as T;
  }

  return response as any;
}

export default apiClient;
