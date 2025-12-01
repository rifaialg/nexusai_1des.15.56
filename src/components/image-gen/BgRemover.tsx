import React, { useState } from 'react';
import { HolographicCard } from '../ui/HolographicCard';
import { UploadZone } from '../ui/UploadZone';
import { NeonButton } from '../ui/NeonButton';
import { Scissors, ArrowRight, Download } from 'lucide-react';

export const BgRemover: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProcess = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setProcessed(true);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">AI Background Remover</h2>
        <p className="text-white/50">Hapus latar belakang gambar secara instan dengan presisi tinggi.</p>
      </div>

      {!image ? (
        <div className="max-w-xl mx-auto" onClick={() => setImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop")}>
          <UploadZone />
          <p className="text-center text-xs text-white/30 mt-4">*Klik untuk simulasi upload</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <HolographicCard className="p-4 relative group">
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs font-bold text-white">Original</div>
            <img src={image} alt="Original" className="w-full rounded-lg" />
          </HolographicCard>

          <div className="flex flex-col items-center gap-4">
             <ArrowRight className="w-8 h-8 text-white/20 rotate-90 md:rotate-0" />
             {!processed && (
               <NeonButton onClick={handleProcess} disabled={loading}>
                 {loading ? (
                   <span className="flex items-center gap-2">
                     <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> 
                     Memproses...
                   </span>
                 ) : (
                   <span className="flex items-center gap-2"><Scissors className="w-4 h-4"/> Hapus Background</span>
                 )}
               </NeonButton>
             )}
          </div>

          <HolographicCard className="p-4 relative border-neon-teal/50">
            <div className="absolute top-4 left-4 px-3 py-1 bg-neon-teal/20 backdrop-blur rounded-full text-xs font-bold text-neon-teal border border-neon-teal/30">Result</div>
            <div className="bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-gray-800 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
              {processed ? (
                <img src={image} alt="Processed" className="w-full rounded-lg drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
              ) : (
                <div className="text-white/20 text-sm">Hasil akan muncul di sini</div>
              )}
            </div>
            {processed && (
              <div className="mt-4 flex justify-end">
                <NeonButton variant="secondary" className="!py-2 !px-4 !text-xs">
                  <Download className="w-4 h-4" /> Unduh PNG
                </NeonButton>
              </div>
            )}
          </HolographicCard>
        </div>
      )}
    </div>
  );
};
