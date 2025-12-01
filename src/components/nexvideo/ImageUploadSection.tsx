import React, { useState, useRef } from 'react';
import { UploadMode, ImageUploadState, ImageSlot } from '../../types/basicMode';
import { UploadCloud, X, Image as ImageIcon, RefreshCw, Grid } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HolographicCard } from '../ui/HolographicCard';

interface ImageUploadSectionProps {
  uploadState: ImageUploadState;
  onStateChange: (newState: ImageUploadState) => void;
}

// Mock Gallery Data
const MOCK_GALLERY = [
  "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&q=80",
  "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=400&q=80",
  "https://images.unsplash.com/photo-1571781348782-f2c426f41119?w=400&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80"
];

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ uploadState, onStateChange }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const handleModeChange = (mode: UploadMode) => {
    onStateChange({ ...uploadState, mode });
  };

  const handleFileProcess = (file: File, slotKey: 'slotA' | 'slotB') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      onStateChange({
        ...uploadState,
        slots: {
          ...uploadState.slots,
          [slotKey]: { ...uploadState.slots[slotKey], file, previewUrl }
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearSlot = (slotKey: 'slotA' | 'slotB') => {
    onStateChange({
      ...uploadState,
      slots: {
        ...uploadState.slots,
        [slotKey]: { ...uploadState.slots[slotKey], file: null, previewUrl: null }
      }
    });
  };

  const handleGallerySelect = (url: string) => {
    // Convert URL to File object (mock implementation)
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "gallery-image.jpg", { type: "image/jpeg" });
        
        // Logic for slot selection
        if (uploadState.mode === 'single') {
          handleFileProcess(file, 'slotA');
        } else {
          // Simple toggle logic for demo: fill empty slot or replace A
          if (!uploadState.slots.slotA.file) handleFileProcess(file, 'slotA');
          else if (!uploadState.slots.slotB.file) handleFileProcess(file, 'slotB');
          else if (confirm("Ganti gambar Slot A?")) handleFileProcess(file, 'slotA');
        }
      });
  };

  const renderDropzone = (slotKey: 'slotA' | 'slotB', label: string) => {
    const slot = uploadState.slots[slotKey];
    const inputRef = slotKey === 'slotA' ? fileInputRefA : fileInputRefB;

    return (
      <div 
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group h-40",
          slot.previewUrl 
            ? "border-neon-teal/50 bg-black" 
            : "border-white/10 bg-[#151520] hover:border-neon-purple/50 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
        )}
        onClick={() => !slot.previewUrl && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-neon-purple'); }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-neon-purple'); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-neon-purple');
          if (e.dataTransfer.files[0]) handleFileProcess(e.dataTransfer.files[0], slotKey);
        }}
      >
        {slot.previewUrl ? (
          <>
            <img src={slot.previewUrl} alt={label} className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleClearSlot(slotKey); }}
                className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-bold text-white border border-white/10">
              {label}
            </div>
          </>
        ) : (
          <div className="p-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5 text-white/30 group-hover:text-neon-purple transition-colors" />
            </div>
            <p className="text-xs text-white/70 font-medium">{label}</p>
            <p className="text-[10px] text-white/30 mt-1">Drop or Click</p>
          </div>
        )}
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0], slotKey)} 
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
      {/* Tab Navigation */}
      <div className="flex p-1 bg-black/40 rounded-xl border border-white/10">
        {[
          { id: 'single', label: 'Single' },
          { id: 'primary_secondary', label: 'Primer / Sekunder' },
          { id: 'front_back', label: 'Depan / Belakang' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleModeChange(tab.id as UploadMode)}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              uploadState.mode === tab.id
                ? "bg-neon-blue/10 border border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Areas */}
      <div className={cn("grid gap-4", uploadState.mode === 'single' ? "grid-cols-1" : "grid-cols-2")}>
        {renderDropzone('slotA', uploadState.mode === 'front_back' ? 'Tampak Depan' : 'Gambar Utama')}
        {uploadState.mode !== 'single' && renderDropzone('slotB', uploadState.mode === 'front_back' ? 'Tampak Belakang' : 'Gambar Pendukung')}
      </div>

      {/* Quick Gallery */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-white/60 uppercase flex items-center gap-2">
            <Grid className="w-3 h-3" /> Galeri Cepat
          </label>
          <button onClick={() => setGalleryOpen(!galleryOpen)} className="text-[10px] text-neon-teal hover:underline">
            {galleryOpen ? 'Tutup' : 'Buka'}
          </button>
        </div>
        
        {galleryOpen && (
          <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-top-2">
            {MOCK_GALLERY.map((url, idx) => (
              <div 
                key={idx}
                onClick={() => handleGallerySelect(url)}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer border border-transparent hover:border-neon-purple transition-all group relative"
              >
                <img src={url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
