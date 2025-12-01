import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Sparkles, Loader2, ArrowDown, AlertTriangle, Info } from 'lucide-react';
import { NeonButton } from '../ui/NeonButton';
import { GlowTextArea } from '../ui/GlowInput';
import { cn } from '../../lib/utils';
import { promptService } from '../../services/promptService';
import { VideoObjective, PromoType } from '../../types/basicMode';

interface MultiSceneGeneratorProps {
  onPromptsChange: (prompts: string[]) => void;
  locationContext?: string;
  objectiveContext?: VideoObjective;
  promoTypeContext?: PromoType;
  brandContext?: string;
  productContext?: string;
}

export const MultiSceneGenerator: React.FC<MultiSceneGeneratorProps> = ({
  onPromptsChange,
  locationContext,
  objectiveContext,
  promoTypeContext,
  brandContext,
  productContext
}) => {
  // State
  const [sceneCount, setSceneCount] = useState(3);
  const [scenes, setScenes] = useState<string[]>(['', '', '']);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleCountChange = (count: number) => {
    try {
      setSceneCount(count);
      setScenes(prev => {
        const newScenes = [...prev];
        if (count > prev.length) {
          for (let i = prev.length; i < count; i++) newScenes.push('');
        } else {
          newScenes.splice(count);
        }
        if (newScenes.length === 0) newScenes.push('');
        onPromptsChange(newScenes);
        return newScenes;
      });
    } catch (err) {
      console.error("Error changing scene count:", err);
      setError("Gagal mengubah jumlah scene.");
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const newScenes = [...scenes];
    newScenes[index] = value;
    setScenes(newScenes);
    onPromptsChange(newScenes);

    if (index === 0 && value.trim()) {
      setError(null);
    }
  };

  const handleEnhanceAll = async () => {
    setError(null);

    // Validasi: Scene 1 harus ada isinya (walaupun sedikit) agar AI punya konteks awal
    if (!scenes[0] || !scenes[0].trim()) {
      setError("Scene 1 (Anchor) wajib diisi sebagai referensi cerita.");
      return;
    }

    setIsEnhancing(true);
    try {
      const scenesToProcess = [...scenes];
      
      // Panggil service dengan context
      const enhanced = await promptService.enhanceStorySequence(scenesToProcess, {
        location: locationContext,
        objective: objectiveContext,
        promoType: promoTypeContext,
        brand: brandContext,
        productName: productContext
      });
      
      if (!enhanced || enhanced.length !== scenesToProcess.length) {
        throw new Error("Hasil AI tidak lengkap.");
      }

      setScenes(enhanced);
      onPromptsChange(enhanced);
    } catch (error: any) {
      console.error("Gagal menyempurnakan cerita", error);
      setError(error.message || "Terjadi kesalahan saat memproses cerita.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const isAnchorMissing = !scenes[0] || !scenes[0].trim();

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 text-red-200 text-xs"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-neon-purple" />
            Multi-Scene Storyboard
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Buat alur cerita berkesinambungan (1-5 Scene).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleCountChange(num)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                sceneCount === num
                  ? "bg-neon-purple text-white shadow-glow-purple"
                  : "text-white/40 hover:text-white hover:bg-white/10"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-neon-purple/50 via-neon-blue/30 to-transparent -z-10" />

        <AnimatePresence>
          {scenes.map((text, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative pl-12"
            >
              <div className={cn(
                "absolute left-0 top-0 w-12 h-12 flex flex-col items-center justify-center z-10",
                index === 0 ? "text-neon-purple" : "text-white/40"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-[#020617] transition-colors duration-300",
                  index === 0 
                    ? (isAnchorMissing ? "border-red-500 text-red-500 animate-pulse" : "border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(124,58,237,0.3)]")
                    : "border-white/10 text-white/40"
                )}>
                  {index + 1}
                </div>
                {index < sceneCount - 1 && (
                  <ArrowDown className="w-3 h-3 mt-1 opacity-20" />
                )}
              </div>

              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300 group",
                index === 0 
                  ? (isAnchorMissing ? "bg-red-500/5 border-red-500/30" : "bg-neon-purple/5 border-neon-purple/30")
                  : "bg-black/40 border-white/10 hover:border-white/20"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <label className={cn(
                    "text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                    index === 0 ? "text-neon-purple" : "text-white/60"
                  )}>
                    {index === 0 ? "Scene 1: Establishing Shot (Anchor)" : `Scene ${index + 1}: Lanjutan`}
                    {index === 0 && isAnchorMissing && <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 rounded">Wajib Diisi</span>}
                  </label>
                  {index === 0 && (
                    <span className="text-[9px] px-2 py-0.5 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/20">
                      Referensi Utama
                    </span>
                  )}
                </div>

                <GlowTextArea
                  value={text}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder={index === 0 
                    ? "Deskripsikan karakter, pakaian, dan lokasi awal secara detail..." 
                    : `Apa yang terjadi selanjutnya? (Karakter akan tetap konsisten)`
                  }
                  rows={3}
                  className={cn(
                    "text-sm bg-black/20 focus:border-neon-purple/50",
                    index === 0 && isAnchorMissing ? "border-red-500/30 focus:border-red-500" : "border-white/5"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-end pt-2">
        <NeonButton
          onClick={handleEnhanceAll}
          disabled={isEnhancing || isAnchorMissing}
          className={cn(
            "w-full sm:w-auto",
            isEnhancing ? "opacity-80 cursor-wait" : "",
            isAnchorMissing ? "opacity-50 cursor-not-allowed grayscale" : ""
          )}
        >
          {isEnhancing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyusun Cerita...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Magic Enhance (Konsistensi Karakter)
            </span>
          )}
        </NeonButton>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start">
        <div className="p-1 bg-blue-500/20 rounded-full mt-0.5">
            <Info className="w-3 h-3 text-blue-400" />
        </div>
        <p className="text-[10px] text-blue-200 leading-relaxed">
            <span className="font-bold">Tips Pro:</span> AI akan menggunakan Scene 1 sebagai "Anchor". Pastikan deskripsi fisik karakter di Scene 1 sangat detail. Scene selanjutnya cukup deskripsikan aksinya, AI akan menjaga wajah dan pakaian tetap sama.
        </p>
      </div>
    </div>
  );
};
