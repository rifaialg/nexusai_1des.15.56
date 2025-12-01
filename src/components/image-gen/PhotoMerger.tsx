import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HolographicCard } from '../ui/HolographicCard';
import { NeonButton } from '../ui/NeonButton';
import { GlossySlider } from '../ui/GlossyControls';
import { Upload, Download, Trash2, Move, Layers as LayersIcon, RotateCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Layer {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  zIndex: number;
}

export const PhotoMerger: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const constraintsRef = useRef(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newLayer: Layer = {
            id: Date.now().toString(),
            src: event.target.result as string,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            zIndex: layers.length + 1,
          };
          setLayers([...layers, newLayer]);
          setSelectedId(newLayer.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedLayer = layers.find(l => l.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <HolographicCard className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LayersIcon className="w-5 h-5 text-neon-teal" /> Layers
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
            {layers.length === 0 && (
              <div className="text-center text-white/30 py-8 text-sm">
                Belum ada gambar. Upload untuk memulai.
              </div>
            )}
            {[...layers].reverse().map((layer, index) => (
              <div 
                key={layer.id}
                onClick={() => setSelectedId(layer.id)}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border",
                  selectedId === layer.id 
                    ? "bg-neon-teal/10 border-neon-teal" 
                    : "bg-white/5 border-transparent hover:bg-white/10"
                )}
              >
                <img src={layer.src} className="w-10 h-10 rounded object-cover bg-black" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">Layer {layers.length - index}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                  className="p-1.5 text-white/40 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
          />
          <NeonButton onClick={() => fileInputRef.current?.click()} fullWidth>
            <Upload className="w-4 h-4" /> Tambah Gambar
          </NeonButton>
        </HolographicCard>

        {/* Transform Controls */}
        {selectedLayer && (
          <HolographicCard className="p-4 space-y-4 animate-in slide-in-from-bottom-4">
            <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">Transform</h4>
            <GlossySlider 
              label="Scale" 
              min={0.1} max={3} step={0.1} 
              value={selectedLayer.scale}
              onChange={(e) => updateLayer(selectedLayer.id, { scale: Number(e.target.value) })}
            />
            <GlossySlider 
              label="Rotation" 
              min={-180} max={180} step={1} 
              value={selectedLayer.rotate}
              onChange={(e) => updateLayer(selectedLayer.id, { rotate: Number(e.target.value) })}
            />
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => updateLayer(selectedLayer.id, { zIndex: selectedLayer.zIndex + 1 })}
                className="flex-1 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 border border-white/10"
              >
                Bring Forward
              </button>
              <button 
                onClick={() => updateLayer(selectedLayer.id, { zIndex: Math.max(0, selectedLayer.zIndex - 1) })}
                className="flex-1 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 border border-white/10"
              >
                Send Backward
              </button>
            </div>
          </HolographicCard>
        )}
      </div>

      {/* Canvas Area */}
      <div className="lg:col-span-9 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-xs text-white/50">
            <Move className="w-4 h-4" /> Drag untuk memindahkan
            <span className="w-px h-4 bg-white/10 mx-2" />
            <RotateCw className="w-4 h-4" /> Gunakan panel kiri untuk rotasi
          </div>
          <NeonButton variant="secondary" className="!py-2 !px-4 !text-xs">
            <Download className="w-4 h-4" /> Unduh Komposisi
          </NeonButton>
        </div>

        <div 
          ref={constraintsRef}
          className="flex-1 bg-[#0a0a15] rounded-2xl border border-white/10 relative overflow-hidden shadow-inner"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        >
          {layers.map((layer) => (
            <motion.div
              key={layer.id}
              drag
              dragConstraints={constraintsRef}
              dragMomentum={false}
              onDragStart={() => setSelectedId(layer.id)}
              style={{
                position: 'absolute',
                zIndex: layer.zIndex,
                x: layer.x, // Initial position logic would need refinement for true persistence
                y: layer.y,
              }}
              className="cursor-move touch-none"
            >
              <div 
                className={cn(
                  "relative transition-all duration-200",
                  selectedId === layer.id ? "ring-2 ring-neon-teal ring-offset-2 ring-offset-transparent" : ""
                )}
                style={{
                  transform: `scale(${layer.scale}) rotate(${layer.rotate}deg)`,
                }}
              >
                <img 
                  src={layer.src} 
                  alt="layer" 
                  className="max-w-[300px] pointer-events-none select-none" 
                />
              </div>
            </motion.div>
          ))}
          
          {layers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 pointer-events-none">
              <LayersIcon className="w-16 h-16 mb-4 opacity-50" />
              <p>Area Kanvas Kosong</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
