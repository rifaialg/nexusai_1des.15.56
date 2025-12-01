import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIContextType, AIProvider as AIProviderKey, ToastState } from '../types/ai';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AIContext = createContext<AIContextType | undefined>(undefined);

const STORAGE_PREFIX = 'NEXUS_AI_KEY_';

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<Record<AIProviderKey, string>>({
    sora: '',
    openai: '',
    stability: ''
  });

  const [toastState, setToastState] = useState<ToastState | null>(null);

  // Load keys from local storage on mount
  useEffect(() => {
    const loadedKeys: Record<string, string> = {};
    const providers: AIProviderKey[] = ['sora', 'openai', 'stability'];

    providers.forEach(provider => {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${provider.toUpperCase()}`);
      if (stored) {
        try {
          // Simple decoding to prevent plain text viewing
          loadedKeys[provider] = atob(stored);
        } catch (e) {
          console.error('Failed to decode key', e);
        }
      }
    });

    setApiKeys(prev => ({ ...prev, ...loadedKeys }));
  }, []);

  // Toast Logic
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToastState({ id, message, type });
    setTimeout(() => setToastState(null), 4000);
  };

  const validateKey = (provider: AIProviderKey, key: string): boolean => {
    if (!key) return false;
    const trimmedKey = key.trim();
    
    // Simple regex validation based on provider patterns
    switch (provider) {
      case 'sora': 
        // KIE.AI Validation: Accepts 32-char hex string OR standard sk- (legacy/openai)
        return /^[a-f0-9]{32}$/i.test(trimmedKey) || trimmedKey.startsWith('sk-');
      case 'openai':
        return trimmedKey.startsWith('sk-');
      default:
        return trimmedKey.length > 5;
    }
  };

  const saveKey = (provider: AIProviderKey, key: string) => {
    const trimmedKey = key.trim();
    
    if (!validateKey(provider, trimmedKey)) {
      showToast(`Format API Key untuk ${provider} tidak valid.`, 'error');
      return;
    }

    try {
      const encoded = btoa(trimmedKey);
      localStorage.setItem(`${STORAGE_PREFIX}${provider.toUpperCase()}`, encoded);
      setApiKeys(prev => ({ ...prev, [provider]: trimmedKey }));
      showToast(`API Key ${provider} berhasil disimpan!`, 'success');
    } catch (error) {
      showToast('Gagal menyimpan API Key ke penyimpanan lokal.', 'error');
    }
  };

  const removeKey = (provider: AIProviderKey) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${provider.toUpperCase()}`);
    setApiKeys(prev => ({ ...prev, [provider]: '' }));
    showToast(`API Key ${provider} dihapus.`, 'info');
  };

  const getKey = (provider: AIProviderKey) => {
    return apiKeys[provider] || null;
  };

  return (
    <AIContext.Provider value={{ 
      apiKeys, 
      saveKey, 
      removeKey, 
      getKey, 
      validateKey,
      toast: { show: showToast, state: toastState } 
    }}>
      {children}
      {/* Global Toast Component Rendered Here */}
      {toastState && (
        <div className={`fixed top-24 right-6 z-[100] px-5 py-4 rounded-xl border backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-10 fade-in duration-300 flex items-center gap-3 min-w-[300px] ${
          toastState.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
          toastState.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          {toastState.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {toastState.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {toastState.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-0.5">{toastState.type}</h4>
            <p className="text-sm opacity-90">{toastState.message}</p>
          </div>
        </div>
      )}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
