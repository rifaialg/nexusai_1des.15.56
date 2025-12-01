import { useState, useCallback } from 'react';
import { useAI } from '../context/AIContext';
import { AIProvider, AIError } from '../types/ai';

interface UseAIQueryOptions<T, P> {
  provider: AIProvider;
  apiFunction: (params: P, apiKey: string) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: AIError) => void;
}

export function useAIQuery<T, P>({ provider, apiFunction, onSuccess, onError }: UseAIQueryOptions<T, P>) {
  const { getKey, toast } = useAI();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (params: P) => {
    const apiKey = getKey(provider);

    // 1. Check API Key Existence
    if (!apiKey) {
      const msg = `API Key untuk ${provider.toUpperCase()} belum dikonfigurasi. Silakan atur di menu Pengaturan.`;
      setError(msg);
      toast.show(msg, 'error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // 2. Execute API Call
      const result = await apiFunction(params, apiKey);
      
      setData(result);
      if (onSuccess) onSuccess(result);
      
    } catch (err: any) {
      // 3. Handle Errors
      const errorMessage = err.message || 'Terjadi kesalahan saat menghubungi layanan AI.';
      setError(errorMessage);
      
      if (onError) {
        onError({ message: errorMessage, provider });
      }
      
      toast.show(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [provider, apiFunction, getKey, toast, onSuccess, onError]);

  return {
    execute,
    data,
    isLoading,
    error,
    reset: () => {
      setData(null);
      setError(null);
      setIsLoading(false);
    }
  };
}
