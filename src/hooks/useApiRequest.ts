import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from './useToast';

interface UseApiRequestOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

interface UseApiRequestReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (endpoint: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for API requests with loading and error states
 * Provides clean API call handling with automatic toast notifications
 */
export function useApiRequest<T = any>(
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const { showSuccessToast = false, showErrorToast = true, successMessage } = options;

  const execute = useCallback(
    async (endpoint: string, requestOptions?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient<T>(endpoint, requestOptions);
        setData(response);

        if (showSuccessToast) {
          toast.success(successMessage || 'Operación exitosa');
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error en la solicitud';
        setError(errorMessage);

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccessToast, showErrorToast, successMessage, toast]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
