import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Megaphone, BookOpen, Sparkles, Eye, Heart, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { VideoObjective, PromoType } from '../../types/basicMode';

interface VideoObjectiveSelectorProps {
  selectedObjective: VideoObjective;
  selectedPromoType?: PromoType;
  onObjectiveChange: (obj: VideoObjective) => void;
  onPromoTypeChange: (type: PromoType) => void;
}

export const VideoObjectiveSelector: React.FC<VideoObjectiveSelectorProps> = ({
  selectedObjective,
  selectedPromoType,
  onObjectiveChange,
  onPromoTypeChange
}) => {
  
  const OBJECTIVES = [
    { id: 'general', label: 'Umum', icon: Target },
    { id: 'promo', label: 'Promosi', icon: Megaphone },
    { id: 'education', label: 'Edukasi', icon: BookOpen },
    { id: 'entertainment', label: 'Hiburan', icon: Sparkles },
  ];

  const PROMO_TYPES = [
    { 
      id: 'awareness', 
      label: 'Awareness', 
      desc: 'Kenalkan Produk', 
      icon: Eye,
      color: 'text-blue-400',
      border: 'border-blue-400/30',
      bg: 'bg-blue-400/10'
    },
    { 
      id: 'soft_selling', 
      label: 'Soft Selling', 
      desc: 'Lifestyle & Emosi', 
      icon: Heart,
      color: 'text-pink-400',
      border: 'border-pink-400/30',
      bg: 'bg-pink-400/10'
    },
    { 
      id: 'hard_selling', 
      label: 'Hard Selling', 
      desc: 'Before-After & CTA', 
      icon: Zap,
      color: 'text-yellow-400',
      border: 'border-yellow-400/30',
      bg: 'bg-yellow-400/10'
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <span className="w-4 h-px bg-white/20"/> Tujuan Video
        </h3>
      </div>

      {/* Main Objectives Chips */}
      <div className="flex flex-wrap gap-2">
        {OBJECTIVES.map((obj) => {
          const Icon = obj.icon;
          const isActive = selectedObjective === obj.id;
          
          return (
            <button
              key={obj.id}
              onClick={() => onObjectiveChange(obj.id as VideoObjective)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 text-xs font-bold",
                isActive
                  ? "bg-neon-teal/10 border-neon-teal text-white shadow-[0_0_10px_rgba(0,243,255,0.15)]"
                  : "bg-[#151520] border-white/10 text-white/50 hover:border-white/30 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-neon-teal" : "opacity-70")} />
              {obj.label}
            </button>
          );
        })}
      </div>

      {/* Conditional Promo Sub-options */}
      <AnimatePresence mode="wait">
        {selectedObjective === 'promo' && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="pt-2 grid grid-cols-3 gap-2">
              {PROMO_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = selectedPromoType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => onPromoTypeChange(type.id as PromoType)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 gap-1.5 group relative overflow-hidden",
                      isActive
                        ? `bg-black ${type.border} shadow-lg`
                        : "bg-white/5 border-transparent hover:bg-white/10"
                    )}
                  >
                    {/* Active Background Glow */}
                    {isActive && (
                      <div className={cn("absolute inset-0 opacity-20 pointer-events-none", type.bg)} />
                    )}

                    <Icon className={cn(
                      "w-4 h-4 transition-transform duration-300",
                      isActive ? type.color : "text-white/40 group-hover:text-white group-hover:scale-110"
                    )} />
                    
                    <div className="text-center">
                      <span className={cn(
                        "block text-[10px] font-bold uppercase tracking-wide",
                        isActive ? "text-white" : "text-white/60"
                      )}>
                        {type.label}
                      </span>
                      <span className="block text-[9px] text-white/30 font-medium leading-tight mt-0.5">
                        {type.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
