import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Palette, Aperture, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GenerationLoaderProps {
  progress: number; // 0 - 100
  type?: 'image' | 'video';
  estimatedTime?: number; // dalam detik (total durasi)
}

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({ 
  progress, 
  type = 'image',
  estimatedTime = 15 // Default 15 detik untuk gambar
}) => {
  const [timeLeft, setTimeLeft] = useState(estimatedTime);

  // Logika Tahapan Status
  const getStatusInfo = (p: number) => {
    if (p < 20) return { text: "Menginisialisasi Neural Network...", icon: Cpu, color: "text-blue-400" };
    if (p < 50) return { text: "Menerjemahkan Konsep Visual...", icon: Sparkles, color: "text-neon-purple" };
    if (p < 80) return { text: "Difusi Pixel & Detail...", icon: Palette, color: "text-pink-400" };
    if (p < 100) return { text: "Finalisasi & Color Grading...", icon: Aperture, color: "text-neon-teal" };
    return { text: "Selesai!", icon: CheckCircle2, color: "text-green-400" };
  };

  const status = getStatusInfo(progress);
  const StatusIcon = status.icon;

  // Hitung mundur estimasi waktu berdasarkan progress
  useEffect(() => {
    // Rumus sederhana: Sisa waktu berkurang seiring bertambahnya progress
    const remaining = Math.max(0, Math.ceil(estimatedTime * (1 - progress / 100)));
    setTimeLeft(remaining);
  }, [progress, estimatedTime]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* --- VISUAL PLACEHOLDER ANIMATION --- */}
      <div className="relative w-64 h-64 mb-8">
        {/* Background Base */}
        <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden flex items-center justify-center">
          
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} 
          />

          {/* Central Pulsing Icon */}
          <div className="relative z-10">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center bg-black/50 border border-white/10 shadow-2xl", status.color)}>
              <StatusIcon className="w-10 h-10 animate-pulse" />
            </div>
            {/* Ripple Effect */}
            <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", status.color.replace('text-', 'bg-'))} />
          </div>

          {/* Scanning Line Effect */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-teal to-transparent shadow-[0_0_15px_#06b6d4] z-20"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          />
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-teal rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-teal rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-teal rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-teal rounded-br-lg" />
      </div>

      {/* --- PROGRESS SECTION --- */}
      <div className="w-full max-w-md space-y-4 z-10">
        
        {/* Status Text & Percentage */}
        <div className="flex justify-between items-end px-1">
          <div className="flex flex-col">
            <span className={cn("text-sm font-bold transition-colors duration-300", status.color)}>
              {status.text}
            </span>
            <span className="text-[10px] text-white/40 mt-0.5">
              AI sedang bekerja... Jangan tutup halaman ini.
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-white">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          {/* Shimmer Background inside bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          
          {/* Fill Bar */}
          <motion.div 
            className="h-full bg-gradient-to-r from-neon-purple to-neon-teal relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          >
            {/* Glow at the tip of the bar */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-white/80 blur-[4px]" />
          </motion.div>
        </div>

        {/* Time Estimation */}
        <div className="flex justify-center items-center gap-2 mt-2">
          <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs text-white/60 font-mono">
              Estimasi: <span className="text-white font-bold">{timeLeft}s</span> lagi
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
