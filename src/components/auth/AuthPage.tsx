import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { NeonButton } from '../ui/NeonButton';
import { SecureInput } from '../ui/SecureInput';
import { GlowInput } from '../ui/GlowInput';
import { Sparkles, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  // Pre-filled values as requested
  const [email, setEmail] = useState('adsrifai@gmail.com');
  const [password, setPassword] = useState('F@ri$2007');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Cek email Anda untuk konfirmasi pendaftaran!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden font-sans">
      {/* Background Glow Effects - Purple Left, Cyan Right */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow delay-1000" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#060b1b]/80 backdrop-blur-2xl border border-[#111827] rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.15)]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {isLogin ? 'Selamat Datang' : 'Buat Akun Baru'}
          </h1>
          <p className="text-[#9CA3AF] text-sm">
            {isLogin ? 'Masuk untuk mengakses studio kreatif AI Anda' : 'Mulai perjalanan kreatif Anda bersama NexusAI'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider ml-1">Email</label>
                <GlowInput 
                    type="email" 
                    placeholder="nama@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                    required
                    className="bg-[#050814] border-[#111827] focus:border-primary/50"
                />
            </div>
            
            <div className="space-y-1">
                {/* Label handled inside SecureInput or manually here for consistency */}
                <SecureInput 
                    label="Password"
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#050814] border-[#111827] focus:border-secondary/50"
                />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger text-sm animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <NeonButton 
            fullWidth 
            disabled={loading}
            className="h-12 text-base shadow-glow-purple hover:shadow-glow-cyan transition-shadow duration-500"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    {isLogin ? 'Masuk Sekarang' : 'Daftar Gratis'} 
                    <ArrowRight className="w-4 h-4" />
                </span>
            )}
          </NeonButton>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#111827] text-center">
          <p className="text-[#9CA3AF] text-sm mb-3">
            {isLogin ? "Belum memiliki akun?" : "Sudah punya akun?"}
          </p>
          <button 
            onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
            }}
            className="text-sm font-bold text-white hover:text-secondary transition-colors relative group inline-block"
          >
            {isLogin ? "Buat Akun Baru" : "Masuk ke Akun"}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full" />
          </button>
        </div>
      </div>
      
      {/* Footer Copyright */}
      <div className="absolute bottom-6 text-center w-full text-[#9CA3AF]/30 text-xs">
        &copy; 2025 NexusAI Creative Suite. All rights reserved.
      </div>
    </div>
  );
};
