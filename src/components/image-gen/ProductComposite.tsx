import React, { useState } from 'react';
import { HolographicCard } from '../ui/HolographicCard';
import { UploadZone } from '../ui/UploadZone';
import { NeonButton } from '../ui/NeonButton';
import { GlossySlider } from '../ui/GlossyControls';
import { ShoppingBag, Image as ImageIcon, Download } from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock Data Produk
const PRODUCTS = [
  { id: 1, name: 'Neon Energy Drink', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, name: 'Cyber Sneakers', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974&auto=format&fit=crop' },
  { id: 3, name: 'Futuristic Watch', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop' },
  { id: 4, name: 'Cosmic Perfume', image: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=2000&auto=format&fit=crop' },
];

export const ProductComposite: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [productScale, setProductScale] = useState(1);
  const [brightness, setBrightness] = useState(100);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setBgImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const activeProduct = PRODUCTS.find(p => p.id === selectedProduct);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Left: Inventory & Upload */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto">
        <HolographicCard className="p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neon-cyan" /> Pilih Produk
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={cn(
                  "group relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all",
                  selectedProduct === product.id 
                    ? "border-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                  <span className="text-xs font-medium text-white">{product.name}</span>
                </div>
              </div>
            ))}
          </div>
        </HolographicCard>

        <HolographicCard className="p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-neon-purple" /> Latar Belakang
          </h3>
          <div className="relative group border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-neon-purple/50 hover:bg-white/5 transition-all cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleBgUpload}
              accept="image/*"
            />
            <p className="text-sm text-white/60">Klik untuk upload background</p>
          </div>
          {bgImage && (
            <div className="mt-4 relative h-20 rounded-lg overflow-hidden border border-white/20">
              <img src={bgImage} alt="BG Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setBgImage(null)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:text-red-400"
              >
                <span className="sr-only">Remove</span>
                ×
              </button>
            </div>
          )}
        </HolographicCard>
      </div>

      {/* Right: Composite Canvas */}
      <div className="lg:col-span-8 flex flex-col">
        <HolographicCard className="flex-1 relative overflow-hidden flex items-center justify-center bg-black/40">
          {bgImage ? (
            <img src={bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10 text-4xl font-bold uppercase tracking-widest pointer-events-none">
              Canvas
            </div>
          )}

          {activeProduct && (
            <div 
              className="relative z-10 transition-all duration-300 drop-shadow-2xl"
              style={{ 
                transform: `scale(${productScale})`,
                filter: `brightness(${brightness}%)`
              }}
            >
              {/* Mocking removed background by using rounded-full or specific styling if images were transparent PNGs */}
              <img 
                src={activeProduct.image} 
                alt="Product" 
                className="max-w-[300px] rounded-xl shadow-2xl border border-white/10" 
              />
            </div>
          )}

          {/* Controls Overlay */}
          {activeProduct && (
            <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-6 animate-in slide-in-from-bottom-10">
              <div className="flex-1">
                <GlossySlider 
                  label="Product Scale" 
                  min={0.5} max={2} step={0.1}
                  value={productScale}
                  onChange={(e) => setProductScale(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <GlossySlider 
                  label="Brightness" 
                  min={50} max={150} step={5}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                />
              </div>
              <NeonButton className="!py-2">
                <Download className="w-4 h-4" /> Save
              </NeonButton>
            </div>
          )}
        </HolographicCard>
      </div>
    </div>
  );
};
