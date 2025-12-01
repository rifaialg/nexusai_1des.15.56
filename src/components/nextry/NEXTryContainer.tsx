import React, { useState, useRef } from 'react';
import { useAI } from '../../context/AIContext';
import { nextryService } from '../../services/nextryService';
import { HolographicCard } from '../ui/HolographicCard';
import { NeonButton } from '../ui/NeonButton';
import { Upload, Shirt, User, Sparkles, Download, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageData {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

export const NEXTryContainer: React.FC = () => {
  const { getKey, toast } = useAI();
  
  // State
  const [productImg, setProductImg] = useState<ImageData | null>(null);
  const [modelImg, setModelImg] = useState<ImageData | null>(null);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for file inputs
  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // Helper: Process File Upload
  const handleFileUpload = (file: File, type: 'product' | 'model') => {
    if (!file.type.startsWith('image/')) {
      toast.show("Mohon unggah file gambar yang valid.", 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      const mimeType = result.match(/:(.*?);/)?.[1] || file.type;

      const newData: ImageData = {
        file,
        preview: result,
        base64,
        mimeType
      };

      if (type === 'product') setProductImg(newData);
      else setModelImg(newData);
      
      setError(null); // Clear previous errors
    };
    reader.readAsDataURL(file);
  };

  // Helper: Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-neon-teal', 'bg-neon-teal/5');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-neon-teal', 'bg-neon-teal/5');
  };

  const handleDrop = (e: React.DragEvent, type: 'product' | 'model') => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-neon-teal', 'bg-neon-teal/5');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file, type);
  };

  // Main Action: Generate
  const handleGenerate = async () => {
    const apiKey = getKey('gemini');
    
    // Validation
    if (!apiKey) {
      const msg = "API Key Gemini belum diatur. Silakan ke menu Pengaturan.";
      setError(msg);
      toast.show(msg, 'error');
      return;
    }
    if (!productImg || !modelImg) {
      toast.show("Harap unggah foto produk dan model terlebih dahulu.", 'error');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImg(null);

    try {
      const resultUrl = await nextryService.generateTryOn(
        apiKey,
        { mimeType: productImg.mimeType, base64: productImg.base64 },
        { mimeType: modelImg.mimeType, base64: modelImg.base64 }
      );
      setResultImg(resultUrl);
      toast.show("Virtual Try-On berhasil!", 'success');
    } catch (err: any) {
      const errMsg = err.message || "Gagal menghasilkan gambar. Coba lagi nanti.";
      setError(errMsg);
      toast.show(errMsg, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
          NEXTry <span className="text-neon-purple">Virtual On</span>
        </h2>
        <p className="text-white/50 max-w-2xl mx-auto">
          Gabungkan produk fashion Anda dengan model secara instan menggunakan AI Generatif.
        </p>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Column 1: Product Upload */}
        <div className="flex flex-col gap-4">
          <HolographicCard className="flex-1 flex flex-col p-6 relative group border-neon-teal/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neon-teal/20 text-neon-teal flex items-center justify-center text-xs">1</span>
                Foto Produk
              </h3>
              {productImg && (
                <button 
                  onClick={() => setProductImg(null)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div 
              className={cn(
                "flex-1 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden",
                productImg 
                  ? "border-neon-teal/50 bg-black/40" 
                  : "border-white/10 hover:border-neon-teal/50 hover:bg-white/5"
              )}
              onClick={() => !productImg && productInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'product')}
            >
              {productImg ? (
                <img src={productImg.preview} alt="Product" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Shirt className="w-8 h-8 text-white/40 group-hover:text-neon-teal" />
                  </div>
                  <p className="text-sm text-white font-medium">Upload Produk</p>
                  <p className="text-xs text-white/40 mt-1">Drag & drop atau klik</p>
                </div>
              )}
              <input 
                type="file" 
                ref={productInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'product')} 
              />
            </div>
          </HolographicCard>
        </div>

        {/* Column 2: Model Upload */}
        <div className="flex flex-col gap-4">
          <HolographicCard className="flex-1 flex flex-col p-6 relative group border-neon-purple/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-xs">2</span>
                Foto Model
              </h3>
              {modelImg && (
                <button 
                  onClick={() => setModelImg(null)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div 
              className={cn(
                "flex-1 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden",
                modelImg 
                  ? "border-neon-purple/50 bg-black/40" 
                  : "border-white/10 hover:border-neon-purple/50 hover:bg-white/5"
              )}
              onClick={() => !modelImg && modelInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'model')}
            >
              {modelImg ? (
                <img src={modelImg.preview} alt="Model" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-white/40 group-hover:text-neon-purple" />
                  </div>
                  <p className="text-sm text-white font-medium">Upload Model</p>
                  <p className="text-xs text-white/40 mt-1">Drag & drop atau klik</p>
                </div>
              )}
              <input 
                type="file" 
                ref={modelInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'model')} 
              />
            </div>
          </HolographicCard>
        </div>

        {/* Column 3: Result */}
        <div className="flex flex-col gap-4">
          <HolographicCard className="flex-1 flex flex-col p-6 border-white/10 bg-black/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs">3</span>
              Hasil AI
            </h3>

            <div className="flex-1 rounded-xl bg-black/50 border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[300px]">
              {isGenerating ? (
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-neon-purple border-r-neon-teal border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white font-medium animate-pulse">AI sedang bekerja...</p>
                  <p className="text-xs text-white/40 mt-1">Proses ini memakan waktu 5-10 detik</p>
                </div>
              ) : resultImg ? (
                <div className="relative w-full h-full group">
                  <img src={resultImg} alt="Result" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <a 
                      href={resultImg} 
                      download="nextry-result.png"
                      className="p-3 rounded-full bg-neon-teal text-black hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.5)]"
                      title="Unduh Gambar"
                    >
                      <Download className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center px-4">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              ) : (
                <div className="text-center text-white/30">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Hasil akan muncul di sini</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <NeonButton 
                fullWidth 
                onClick={handleGenerate}
                disabled={isGenerating || !productImg || !modelImg}
                className={cn(
                  "py-4 text-lg",
                  (!productImg || !modelImg) && "opacity-50 cursor-not-allowed hover:shadow-none"
                )}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Generate Try-On
                  </span>
                )}
              </NeonButton>
            </div>
          </HolographicCard>
        </div>
      </div>
    </div>
  );
};
