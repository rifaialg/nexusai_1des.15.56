import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Move, ZoomIn, RotateCw, RefreshCw, 
  Check, X, Image as ImageIcon, Video 
} from 'lucide-react';
import { HolographicCard } from '../ui/HolographicCard';
import { GlossySlider } from '../ui/GlossyControls';
import { NeonButton } from '../ui/NeonButton';
import { cn } from '../../lib/utils';

interface ProductPlacementToolProps {
  backgroundSrc: string | null;
  productSrc: string | null;
  isVideoBackground?: boolean;
  onSave?: (compositionData: PlacementData) => void;
  onCancel?: () => void;
}

export interface PlacementData {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const ProductPlacementTool: React.FC<ProductPlacementToolProps> = ({
  backgroundSrc,
  productSrc,
  isVideoBackground = false,
  onSave,
  onCancel
}) => {
  // Container Ref untuk batasan drag
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State Transformasi
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Smart Scaling Initialization
  useEffect(() => {
    if (productSrc && containerRef.current) {
      // Reset ke default cerdas saat produk berubah
      // Target: 25% dari lebar container
      const containerWidth = containerRef.current.offsetWidth;
      // Kita asumsikan base width gambar produk dirender pada ~150px-200px css pixels awalnya
      // Logic ini akan visual saja, scale 1 = ukuran render default
      setScale(1.0); 
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [productSrc]);

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        x: position.x,
        y: position.y,
        scale,
        rotation
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Controls */}
      <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-neon-teal/20 rounded-lg text-neon-teal">
            <Move className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Product Placement</h3>
            <p className="text-[10px] text-white/50">Sesuaikan posisi produk agar presisi</p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
          title="Reset Posisi"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative min-h-[300px] bg-[#050510] rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center group">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} 
        />

        <div 
          ref={containerRef}
          className="relative w-full h-full max-w-full max-h-full flex items-center justify-center overflow-hidden"
        >
          {/* Layer 1: Background (Video/Image) */}
          {backgroundSrc ? (
            isVideoBackground ? (
              <video 
                src={backgroundSrc} 
                className="w-full h-full object-contain opacity-60 pointer-events-none"
                autoPlay loop muted playsInline
              />
            ) : (
              <img 
                src={backgroundSrc} 
                alt="Background" 
                className="w-full h-full object-contain opacity-60 pointer-events-none select-none"
              />
            )
          ) : (
            <div className="text-white/20 flex flex-col items-center">
              <ImageIcon className="w-12 h-12 mb-2" />
              <p className="text-xs">Tidak ada background</p>
            </div>
          )}

          {/* Layer 2: Product Overlay (Draggable) */}
          {productSrc && (
            <motion.div
              drag
              dragConstraints={containerRef}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(_, info) => {
                setIsDragging(false);
                setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
              }}
              style={{
                scale,
                rotate: rotation,
                x: position.x, // Note: Framer motion handles visual transform, but saving exact coords requires state sync if needed for backend
                y: position.y,
                position: 'absolute',
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 10,
              }}
              className="w-[30%] max-w-[250px] min-w-[80px]" // Smart Sizing: ~30% container width
            >
              <div className={cn(
                "relative transition-all duration-200",
                isDragging ? "scale-105 opacity-90" : ""
              )}>
                {/* Visual Guide Box */}
                <div className={cn(
                  "absolute inset-0 border-2 border-neon-teal/50 rounded-lg pointer-events-none transition-opacity",
                  isDragging || scale !== 1 ? "opacity-100" : "opacity-0 hover:opacity-100"
                )} />
                
                <img 
                  src={productSrc} 
                  alt="Product Overlay" 
                  className="w-full h-auto object-contain drop-shadow-2xl select-none pointer-events-none"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Overlay Controls Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-[10px] text-white/70 pointer-events-none">
          Drag untuk memindahkan • Gunakan slider untuk skala
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3"/> Skala</span>
              <span className="font-mono text-neon-teal">{Math.round(scale * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.2" max="2.5" step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-teal hover:accent-neon-cyan"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span className="flex items-center gap-1"><RotateCw className="w-3 h-3"/> Rotasi</span>
              <span className="font-mono text-neon-purple">{rotation}°</span>
            </div>
            <input 
              type="range" 
              min="-180" max="180" step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-purple hover:accent-pink-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/10">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-xs font-bold hover:bg-white/5 hover:text-white transition-colors"
            >
              Batal
            </button>
          )}
          <NeonButton 
            onClick={handleSave}
            className="flex-1 !py-2.5 !text-xs"
          >
            <Check className="w-4 h-4 mr-2" /> Terapkan Posisi
          </NeonButton>
        </div>
      </div>
    </div>
  );
};
