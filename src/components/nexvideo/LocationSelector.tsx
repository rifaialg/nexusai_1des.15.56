import React, { useState } from 'react';
import { MapPin, X, Trees, Building2, Coffee, Briefcase, Mountain, Sofa, Camera, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HolographicCard } from '../ui/HolographicCard';
import { cn } from '../../lib/utils';

interface LocationSelectorProps {
  selectedLocation?: string;
  onSelect: (location: string) => void;
}

const LOCATIONS = [
  { id: 'Mekkah', label: 'Mekkah (Holy City)', icon: Moon, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { id: 'Hutan', label: 'Hutan Alam', icon: Trees, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  { id: 'Perkotaan', label: 'Kota Malam (Cyberpunk)', icon: Building2, color: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20' },
  { id: 'Futuristik', label: 'Interior Futuristik', icon: Camera, color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/20' },
  { id: 'Cafe', label: 'Aesthetic Cafe', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { id: 'Kantor', label: 'Kantor Modern', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'Pantai', label: 'Pantai Sunset', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { id: 'Gunung', label: 'Puncak Gunung', icon: Mountain, color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/20' },
  { id: 'Studio', label: 'Studio Minimalis', icon: Sofa, color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' },
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocation, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 group",
            selectedLocation 
              ? "bg-neon-teal/10 border-neon-teal text-white shadow-[0_0_15px_rgba(0,243,255,0.15)]" 
              : "bg-[#151520] border-white/10 text-white/60 hover:border-white/30 hover:text-white"
          )}
        >
          <MapPin className={cn("w-4 h-4", selectedLocation ? "text-neon-teal" : "text-white/40 group-hover:text-white")} />
          <span className="text-xs font-bold uppercase tracking-wider">
            {selectedLocation || "Pilih Lokasi / Latar"}
          </span>
        </button>
        
        {selectedLocation && (
          <button 
            onClick={() => onSelect('')}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Hapus Lokasi"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl"
            >
              <HolographicCard className="p-0 overflow-hidden border-neon-teal/30 shadow-2xl">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-neon-teal/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon-teal/20 rounded-lg">
                      <MapPin className="w-5 h-5 text-neon-teal" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Pilih Lokasi Video</h3>
                      <p className="text-xs text-white/50">Lokasi akan menentukan pencahayaan dan atmosfer video.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Grid */}
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {LOCATIONS.map((loc) => {
                    const Icon = loc.icon;
                    const isSelected = selectedLocation === loc.id;
                    
                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelect(loc.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group overflow-hidden min-h-[120px]",
                          isSelected 
                            ? `bg-black ${loc.border} shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]` 
                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                        )}
                      >
                        {/* Background Glow */}
                        <div className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                          loc.bg
                        )} />
                        
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-300",
                          loc.bg,
                          isSelected ? "scale-110" : "group-hover:scale-110"
                        )}>
                          <Icon className={cn("w-6 h-6", loc.color)} />
                        </div>
                        
                        <span className={cn(
                          "text-xs font-bold text-center transition-colors",
                          isSelected ? "text-white" : "text-white/60 group-hover:text-white"
                        )}>
                          {loc.label}
                        </span>

                        {isSelected && (
                          <div className={cn("absolute inset-0 border-2 rounded-2xl pointer-events-none", loc.color.replace('text-', 'border-'))} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </HolographicCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
