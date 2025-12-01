import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, UploadCloud, Image as ImageIcon, 
  Sparkles, Info, Wand2, Loader2, ArrowDown
} from 'lucide-react';
import { ImageScene } from '../../types/basicMode';
import { NeonButton } from '../ui/NeonButton';
import { cn } from '../../lib/utils';
import { promptService } from '../../services/promptService';
import { VideoObjective, PromoType } from '../../types/basicMode';

interface MultiImageSceneGeneratorProps {
  onScenesChange: (scenes: ImageScene[]) => void;
  locationContext?: string;
  objectiveContext?: VideoObjective;
  promoTypeContext?: PromoType;
  brandContext?: string;
  productContext?: string;
}

export const MultiImageSceneGenerator: React.FC<MultiImageSceneGeneratorProps> = ({ 
  onScenesChange,
  locationContext,
  objectiveContext,
  promoTypeContext,
  brandContext,
  productContext
}) => {
  // --- STATE ---
  // Global Image State (Single Source of Truth)
  const [globalImage, setGlobalImage] = useState<File | null>(null);
  const [globalPreview, setGlobalPreview] = useState<string | null>(null);
  
  // Scenes State (Text focused)
  const [scenes, setScenes] = useState<ImageScene[]>([
    { id: Date.now().toString(), file: null, previewUrl: null, prompt: '' },
    { id: (Date.now() + 1).toString(), file: null, previewUrl: null, prompt: '' },
    { id: (Date.now() + 2).toString(), file: null, previewUrl: null, prompt: '' }
  ]);

  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  
  // Sync scenes to parent whenever scenes or global image changes
  useEffect(() => {
    // Map global image to all scenes for backend compatibility
    const syncedScenes = scenes.map(s => ({
      ...s,
      file: globalImage,
      previewUrl: globalPreview
    }));
    onScenesChange(syncedScenes);
  }, [scenes, globalImage, globalPreview, onScenesChange]);

  // --- HANDLERS ---

  const handleGlobalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGlobalImage(file);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setGlobalPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddScene = () => {
    if (scenes.length >= 5) return;
    setScenes(prev => [...prev, { 
      id: Date.now().toString(), 
      file: globalImage, 
      previewUrl: globalPreview, 
      prompt: '' 
    }]);
  };

  const handleRemoveScene = (id: string) => {
    if (scenes.length <= 1) return;
    setScenes(prev => prev.filter(s => s.id !== id));
  };

  const handlePromptChange = (index: number, value: string) => {
    setScenes(prev => prev.map((s, i) => i === index ? { ...s, prompt: value } : s));
  };

  // --- MAGIC STORY GENERATOR LOGIC ---
  const handleGenerateStory = async () => {
    if (!globalImage) return; // Should be disabled in UI, but double check

    setIsGeneratingStory(true);
    try {
      const generatedPrompts = await promptService.generateStoryFromVisuals(scenes.length, {
        location: locationContext,
        objective: objectiveContext,
        promoType: promoTypeContext,
        brand: brandContext,
        productName: productContext
      });

      // Populate scenes sequentially
      setScenes(prev => prev.map((scene, idx) => ({
        ...scene,
        prompt: generatedPrompts[idx] || scene.prompt // Fallback to existing if array mismatch
      })));

    } catch (error) {
      console.error("Story generation failed", error);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. GLOBAL REFERENCE IMAGE UPLOAD */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-neon-teal" />
            Global Reference Image
          </label>
          <span className="text-[10px] bg-neon-teal/20 text-neon-teal px-2 py-0.5 rounded border border-neon-teal/30 font-bold">
            MAIN CHARACTER / PRODUCT
          </span>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative w-full h-48 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group flex flex-col items-center justify-center",
            globalPreview 
              ? "border-neon-teal/50 bg-black" 
              : "border-white/10 bg-[#0a0a12] hover:border-neon-teal/30 hover:bg-white/5"
          )}
        >
          {globalPreview ? (
            <>
              <img src={globalPreview} className="w-full h-full object-contain p-2" alt="Reference" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 text-white text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-neon-teal" /> Ganti Gambar Utama
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-8 h-8 text-white/30 group-hover:text-neon-teal transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-white">Upload Referensi Visual</h3>
              <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
                Gambar ini akan menjadi acuan visual konsisten untuk semua scene (Karakter, Produk, Warna).
              </p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleGlobalUpload} 
          />
        </div>
      </div>

      {/* 2. SCENE LIST (TEXT FOCUSED) */}
      <div className="space-y-4 relative">
        {/* Connecting Line Visual */}
        <div className="absolute left-[1.65rem] top-6 bottom-6 w-0.5 bg-gradient-to-b from-neon-teal/50 via-neon-purple/30 to-transparent -z-10" />

        <AnimatePresence mode="popLayout">
          {scenes.map((scene, index) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative pl-14"
            >
              {/* Number Badge */}
              <div className={cn(
                "absolute left-0 top-0 w-14 h-14 flex flex-col items-center justify-center z-10",
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 bg-[#020617] transition-colors duration-300 shadow-lg",
                  index === 0 
                    ? "border-neon-teal text-neon-teal shadow-neon-teal/20"
                    : "border-[#1e293b] text-white/40"
                )}>
                  {index + 1}
                </div>
                {index < scenes.length - 1 && (
                  <ArrowDown className="w-4 h-4 mt-1 text-white/10" />
                )}
              </div>

              {/* Scene Card */}
              <div className={cn(
                "p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                index === 0 
                  ? "bg-neon-teal/5 border-neon-teal/30" 
                  : "bg-[#0a0a12] border-white/10 hover:border-white/20"
              )}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      index === 0 ? "text-neon-teal" : "text-white/60"
                    )}>
                      {index === 0 ? "Scene 1: Opening (Anchor)" : `Scene ${index + 1}: Sequence`}
                    </span>
                    {index === 0 && (
                      <span className="text-[9px] bg-neon-teal/20 text-neon-teal px-1.5 py-0.5 rounded font-bold">
                        KEY FRAME
                      </span>
                    )}
                  </div>
                  {scenes.length > 1 && (
                    <button 
                      onClick={() => handleRemoveScene(scene.id)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Input Area */}
                <div className="relative">
                  <textarea
                    value={scene.prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    placeholder={index === 0 
                      ? "Deskripsikan adegan pembuka. Klik tombol 'Magic' untuk otomatis membuat cerita dari gambar..." 
                      : "Lanjutan cerita..."}
                    className={cn(
                      "w-full bg-black/40 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none min-h-[100px]",
                      index === 0 ? "border-neon-teal/30 focus:border-neon-teal" : "border-white/10 focus:border-white/30",
                      isGeneratingStory && "opacity-50"
                    )}
                    disabled={isGeneratingStory}
                  />

                  {/* MASTER MAGIC BUTTON (Only in Scene 1) */}
                  {index === 0 && (
                    <div className="absolute bottom-3 right-3">
                      <NeonButton
                        onClick={handleGenerateStory}
                        disabled={isGeneratingStory || !globalImage}
                        className={cn(
                          "!py-1.5 !px-3 !text-[10px] shadow-lg flex items-center gap-2 transition-all",
                          !globalImage ? "opacity-50 cursor-not-allowed grayscale" : "hover:scale-105"
                        )}
                        title={!globalImage ? "Upload gambar dulu" : "Analisis gambar & buat cerita otomatis"}
                      >
                        {isGeneratingStory ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Menulis Cerita...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3" />
                            Enhance Story
                          </>
                        )}
                      </NeonButton>
                    </div>
                  )}
                </div>

                {/* Warning if no image */}
                {index === 0 && !globalImage && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-yellow-500/80">
                    <Info className="w-3 h-3" />
                    <span>Upload gambar referensi di atas untuk mengaktifkan AI Story Generator.</span>
                  </div>
                )}

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="pl-14">
        <button
          onClick={handleAddScene}
          disabled={scenes.length >= 5}
          className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Tambah Scene ({scenes.length}/5)
        </button>
      </div>

    </div>
  );
};
