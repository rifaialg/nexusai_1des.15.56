import React, { useState } from 'react';
import { Wand2, Sparkles, X, Check, Loader2, Edit3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { promptService } from '../../services/promptService';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './NeonButton';
import { VideoObjective, PromoType } from '../../types/basicMode';

interface EnhancedTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  locationContext?: string;
  objectiveContext?: VideoObjective;
  promoTypeContext?: PromoType;
  brandContext?: string;
  productContext?: string;
  
  onEnhance?: (newPrompt: string) => void;
}

export const EnhancedTextArea: React.FC<EnhancedTextAreaProps> = ({ 
  className, 
  label, 
  value, 
  onChange, 
  onEnhance,
  locationContext,
  objectiveContext,
  promoTypeContext,
  brandContext,
  productContext,
  ...props 
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState('');

  const handleMagicClick = async () => {
    const currentText = String(value || '');
    if (!currentText.trim() && !locationContext) return;

    setIsEnhancing(true);
    try {
      const result = await promptService.enhance(currentText, { 
        location: locationContext,
        objective: objectiveContext,
        promoType: promoTypeContext,
        brand: brandContext,
        productName: productContext
      });
      setEnhancedResult(result);
      setShowDiff(true);
    } catch (error) {
      console.error("Failed to enhance prompt", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancement = () => {
    const syntheticEvent = {
      target: { value: enhancedResult }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    if (onChange) onChange(syntheticEvent);
    if (onEnhance) onEnhance(enhancedResult);
    
    setShowDiff(false);
  };

  return (
    <div className="space-y-2 font-sans">
      {label && (
        <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">
            {label}
            </label>
            <div className="flex items-center gap-1 text-[10px] text-neon-purple animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>AI Enhanced</span>
            </div>
        </div>
      )}
      
      <div className="relative group">
        <textarea
          value={value}
          onChange={onChange}
          className={cn(
            "w-full bg-[#050814]/80 border border-[#111827] rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/30 outline-none transition-all duration-300 resize-none",
            "focus:border-neon-purple focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] focus:bg-[#060b1b]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          disabled={isEnhancing}
          {...props}
        />

        <div className="absolute bottom-3 right-3 z-10">
          <button
            type="button"
            onClick={handleMagicClick}
            disabled={isEnhancing}
            className={cn(
              "p-2 rounded-lg transition-all duration-300 flex items-center gap-2",
              isEnhancing 
                ? "bg-neon-purple/20 text-neon-purple cursor-wait" 
                : "bg-white/5 text-white/40 hover:bg-neon-purple hover:text-white hover:shadow-glow-purple hover:scale-105"
            )}
            title="Sempurnakan Prompt dengan AI"
          >
            {isEnhancing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Diff Comparison Modal */}
      <AnimatePresence>
        {showDiff && (
          <motion.div 
            key="modal-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowDiff(false)}
            />

            <motion.div 
              key="modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-neon-purple/30 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-gradient-to-r from-neon-purple/10 to-transparent flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-neon-purple/20 rounded-lg">
                        <Sparkles className="w-4 h-4 text-neon-purple" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Optimasi Prompt AI</h3>
                      <p className="text-[10px] text-white/50">Tinjau dan edit hasil saran AI sebelum digunakan</p>
                    </div>
                </div>
                <button onClick={() => setShowDiff(false)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-gray-500" /> Original
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-white/70 min-h-[150px] leading-relaxed">
                        {value || "(Prompt Kosong)"}
                    </div>
                </div>

                <div className="space-y-2 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-neon-teal uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-neon-teal animate-pulse" /> Enhanced Result
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-neon-teal/70">
                        <Edit3 className="w-3 h-3" />
                        <span>Dapat diedit</span>
                      </div>
                    </div>
                    
                    <div className="relative flex-1">
                      <textarea
                          value={enhancedResult}
                          onChange={(e) => setEnhancedResult(e.target.value)}
                          className="w-full h-full min-h-[150px] p-4 rounded-xl bg-neon-teal/5 border border-neon-teal/30 text-sm text-white leading-relaxed shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal/50 transition-all resize-y custom-scrollbar font-sans"
                          placeholder="Hasil AI akan muncul di sini..."
                      />
                    </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3 flex-shrink-0">
                <button 
                    onClick={() => setShowDiff(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                    Batal
                </button>
                <NeonButton 
                    onClick={applyEnhancement}
                    className="!py-2 !px-6 text-sm"
                >
                    <Check className="w-4 h-4 mr-2" /> Gunakan Hasil Ini
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
