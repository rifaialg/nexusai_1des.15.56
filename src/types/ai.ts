export type AIProvider = 'sora' | 'openai' | 'stability';

export interface AIContextType {
  apiKeys: Record<AIProvider, string>;
  saveKey: (provider: AIProvider, key: string) => void;
  removeKey: (provider: AIProvider) => void;
  getKey: (provider: AIProvider) => string | null;
  validateKey: (provider: AIProvider, key: string) => boolean;
  toast: {
    show: (message: string, type: 'success' | 'error' | 'info') => void;
    state: ToastState | null;
  };
}

export interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AIResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export interface AIError {
  message: string;
  code?: string;
  provider?: AIProvider;
}
