import React, { useState } from 'react';
import { useAI } from '../../context/AIContext';
import { supabase } from '../../lib/supabase';
import { HolographicCard } from '../ui/HolographicCard';
import { NeonButton } from '../ui/NeonButton';
import { SecureInput } from '../ui/SecureInput';
import { Video, Save, Trash2, Key, ExternalLink, Database, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { AIProvider } from '../../types/ai';

export const ApiSettings: React.FC = () => {
  const { apiKeys, saveKey, removeKey, toast } = useAI();
  
  // Local state for inputs before saving
  const [inputs, setInputs] = useState({
    sora: apiKeys.sora || ''
  });

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [storageStatus, setStorageStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

  const handleInputChange = (provider: string, value: string) => {
    setInputs(prev => ({ ...prev, [provider]: value }));
  };

  const handleSave = async (provider: AIProvider) => {
    setLoading(prev => ({ ...prev, [provider]: true }));
    
    // Simulate network delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    saveKey(provider, inputs[provider]);
    setLoading(prev => ({ ...prev, [provider]: false }));
  };

  const handleRemove = (provider: AIProvider) => {
    if (confirm('Apakah Anda yakin ingin menghapus API Key ini? Fitur terkait tidak akan berfungsi.')) {
      removeKey(provider);
      setInputs(prev => ({ ...prev, [provider]: '' }));
    }
  };

  const testStorageConnection = async () => {
    setStorageStatus('checking');
    try {
        // 1. Coba upload file dummy kecil
        const dummyBlob = new Blob(['test'], { type: 'text/plain' });
        const fileName = `test_connection_${Date.now()}.txt`;
        
        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, dummyBlob);
            
        if (uploadError) throw uploadError;

        // 2. Coba hapus file tersebut (cleanup)
        await supabase.storage.from('uploads').remove([fileName]);

        setStorageStatus('success');
        toast.show('Koneksi Storage Berhasil! Bucket siap digunakan.', 'success');
    } catch (error: any) {
        console.error("Storage Test Failed:", error);
        setStorageStatus('error');
        let msg = "Gagal terhubung ke Storage.";
        if (error.message?.includes('Bucket not found')) msg += " Bucket 'uploads' belum dibuat.";
        else if (error.message?.includes('row-level security')) msg += " Izin akses ditolak (RLS Error).";
        else msg += ` ${error.message}`;
        
        toast.show(msg, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Key className="w-6 h-6 text-neon-teal" />
          Manajemen API & Sistem
        </h2>
        <p className="text-white/60">
          Konfigurasi kunci API dan verifikasi koneksi sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SORA / KIE.AI API Card */}
        <HolographicCard className="p-6 flex flex-col h-full border-neon-purple/30" hoverEffect>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-indigo-600 flex items-center justify-center shadow-neon-purple/50">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">KIE.AI (Universal)</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                  Sora Video
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  Ideogram Image
                </span>
                {apiKeys.sora && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Key Tersimpan
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-white/50 mb-6 flex-1">
            Satu kunci untuk semua layanan Kie AI (Sora Video Generator & Ideogram Image Studio).
          </p>

          <div className="space-y-4">
            <SecureInput 
              label="KIE.AI API KEY" 
              placeholder="Contoh: b871def962cc7c3c84ffb318b760f71f" 
              value={inputs.sora}
              onChange={(e) => handleInputChange('sora', e.target.value)}
            />
            
            <div className="flex gap-2 mt-2">
              <NeonButton 
                fullWidth 
                onClick={() => handleSave('sora')}
                disabled={loading['sora']}
              >
                {loading['sora'] ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan</>}
              </NeonButton>
              
              {apiKeys.sora && (
                <button 
                  onClick={() => handleRemove('sora')}
                  className="px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-center">
                <a href="https://kie.ai/dashboard" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/30 hover:text-neon-teal inline-flex items-center gap-1 transition-colors">
                    Dapatkan API Key <ExternalLink className="w-3 h-3" />
                </a>
            </div>
          </div>
        </HolographicCard>

        {/* SYSTEM STATUS CARD */}
        <HolographicCard className="p-6 flex flex-col h-full border-neon-teal/30" hoverEffect>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-teal to-cyan-600 flex items-center justify-center shadow-neon-teal/50">
                    <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">System Status</h3>
                    <p className="text-xs text-white/50">Supabase Storage & Database</p>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Storage Bucket</span>
                        {storageStatus === 'success' ? (
                            <span className="text-xs font-bold text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Ready</span>
                        ) : storageStatus === 'error' ? (
                            <span className="text-xs font-bold text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Error</span>
                        ) : (
                            <span className="text-xs font-bold text-white/40">Unknown</span>
                        )}
                    </div>
                    <p className="text-xs text-white/40">
                        Bucket 'uploads' diperlukan untuk menyimpan gambar referensi sebelum diproses AI.
                    </p>
                </div>

                <NeonButton 
                    variant="secondary" 
                    fullWidth 
                    onClick={testStorageConnection}
                    disabled={storageStatus === 'checking'}
                >
                    {storageStatus === 'checking' ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Memeriksa...</span>
                    ) : (
                        <span className="flex items-center gap-2"><Database className="w-4 h-4"/> Test Koneksi Storage</span>
                    )}
                </NeonButton>
            </div>
        </HolographicCard>
      </div>
    </div>
  );
};
