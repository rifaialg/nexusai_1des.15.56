import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { ideogramService } from '../../services/ideogramService';
import { geminiService } from '../../services/geminiService';
import { IdeogramImageSize, IdeogramStyle, IdeogramSpeed } from '../../types/ideogram';
import { HolographicCard } from '../ui/HolographicCard';
import { GlowTextArea } from '../ui/GlowInput';
import { GlossySelect, GlossyToggle } from '../ui/GlossyControls';
import { NeonButton } from '../ui/NeonButton';
import { GenerationLoader } from '../ui/GenerationLoader'; // Import Loader Baru
import { Wand2, Maximize2, Download, Loader2, AlertCircle, Image as ImageIcon, Languages, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TextToImage: React.FC = () => {
  const { getKey, toast } = useAI();
  
  // State Inputs
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<IdeogramImageSize>('landscape_16_9');
  const [style, setStyle] = useState<IdeogramStyle>('AUTO');
  const [speed, setSpeed] = useState<IdeogramSpeed>('BALANCED');
  const [expandPrompt, setExpandPrompt] = useState(true); 
  const [autoTranslate, setAutoTranslate] = useState(true); 
  
  // State Process
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); 
  const [taskId, setTaskId] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    const soraKey = getKey('sora'); 
    const geminiKey = getKey('gemini'); 

    if (!soraKey) {
      toast.show("API Key Kie AI (Sora/Ideogram) belum diatur.", 'error');
      return;
    }
    if (!prompt.trim()) {
      toast.show("Prompt tidak boleh kosong.", 'error');
      return;
    }

    setIsGenerating(true);
    setResultImage(null);
    setOptimizedPrompt(null);
    setError(null);
    setProgress(0);

    try {
      let finalPrompt = prompt;

      // --- STEP 1: Terjemahan & Optimasi (0 - 20%) ---
      if (autoTranslate && geminiKey) {
        setStatusMessage('Menerjemahkan & Mengoptimalkan Prompt...');
        setProgress(5);
        try {
          finalPrompt = await geminiService.optimizeImagePrompt(geminiKey, prompt);
          setOptimizedPrompt(finalPrompt);
          setProgress(15);
        } catch (e) {
          console.warn("Gagal optimasi prompt, menggunakan prompt asli.");
          setProgress(15);
        }
      } else if (autoTranslate && !geminiKey) {
        toast.show("API Key Gemini diperlukan untuk fitur Auto-Translate.", 'info');
      }

      // --- STEP 2: Kirim ke Ideogram (20 - 30%) ---
      setStatusMessage('Mengirim ke Ideogram AI...');
      setProgress(20);
      
      const id = await ideogramService.createTask(soraKey, {
        prompt: finalPrompt,
        image_size: imageSize,
        style,
        rendering_speed: speed,
        expand_prompt: expandPrompt,
        num_images: "1"
      });

      setTaskId(id);
      setProgress(30); // Task Created
      setStatusMessage('Sedang Melukis...');
      
      // Start Polling
      pollingRef.current = setInterval(() => pollStatus(id, soraKey), 3000);

    } catch (err: any) {
      // --- DEMO MODE FALLBACK ---
      const errMsg = err.message?.toLowerCase() || '';
      const fallbackTriggers = ['insufficient', 'credit', 'balance', '404', 'network error'];

      if (fallbackTriggers.some(trigger => errMsg.includes(trigger))) {
        console.warn("Switching to Demo Mode due to API error:", errMsg);
        toast.show("Mode Demo: Menggunakan simulasi karena kendala API/Kredit.", "info");
        
        setTaskId(`demo_${Date.now()}`);
        setProgress(30);
        
        // Simulasi Progress yang lebih halus untuk demo
        let demoProgress = 30;
        pollingRef.current = setInterval(() => {
          // Increment acak agar terlihat natural
          demoProgress += Math.floor(Math.random() * 5) + 2; 
          setProgress(Math.min(demoProgress, 98));
          
          if (demoProgress >= 100) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setResultImage("https://images.unsplash.com/photo-1675271591211-126ad94e495d?q=80&w=1932&auto=format&fit=crop");
            setIsGenerating(false);
            setProgress(100);
            toast.show("Gambar berhasil dibuat (Demo)!", 'success');
          }
        }, 500); // Update setiap 500ms
      } else {
        setIsGenerating(false);
        setError(err.message);
        toast.show(err.message, 'error');
      }
    }
  };

  const pollStatus = async (id: string, apiKey: string) => {
    try {
      const data = await ideogramService.getTaskStatus(apiKey, id);
      const state = data.state;

      if (state === 'success') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        if (data.resultUrls && data.resultUrls.length > 0) {
          setProgress(100);
          // Sedikit delay sebelum menampilkan gambar agar user melihat progress 100%
          setTimeout(() => {
            setResultImage(data.resultUrls![0]);
            setIsGenerating(false);
            toast.show("Gambar berhasil dibuat!", 'success');
          }, 500);
        } else {
          throw new Error("Gambar selesai tapi URL tidak ditemukan.");
        }
      } else if (state === 'fail') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        throw new Error(data.failReason || "Generasi gambar gagal.");
      } else {
        // Update progress visual (30% -> 95%)
        setProgress((prev) => {
            // Jika API memberikan progress, gunakan itu. Jika tidak, simulasi increment.
            const apiProgress = data.progress;
            if (apiProgress) {
                // Mapping API progress (biasanya 0-100) ke range UI kita (30-95)
                return Math.max(prev, 30 + (apiProgress * 0.65));
            }
            // Simulasi lambat jika API tidak memberi info progress
            return Math.min(prev + 2, 95);
        });
      }
    } catch (err: any) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setIsGenerating(false);
      setError(err.message);
      toast.show(err.message, 'error');
    }
  };

  // Helper untuk mapping rasio ke label UI
  const RATIO_OPTIONS: { id: IdeogramImageSize; label: string }[] = [
    { id: 'landscape_16_9', label: '16:9' },
    { id: 'portrait_16_9', label: '9:16' },
    { id: 'square_hd', label: '1:1' },
    { id: 'landscape_4_3', label: '4:3' },
    { id: 'portrait_4_3', label: '3:4' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Controls Panel */}
      <div className="lg:col-span-4 space-y-6 overflow-y-auto custom-scrollbar pb-10">
        <HolographicCard className="p-6 space-y-6 border-neon-teal/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-neon-purple flex items-center justify-center shadow-neon-purple/30">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Ideogram v3</h2>
              <p className="text-xs text-white/40">Powered by Kie AI</p>
            </div>
          </div>

          {/* Prompt Section */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex justify-between items-center">
              Prompt (Bisa Bahasa Indonesia)
              <div className="flex items-center gap-1.5" title="Otomatis terjemahkan & optimalkan prompt menggunakan AI">
                <Languages className="w-3 h-3 text-neon-teal" />
                <span className="text-[10px] text-neon-teal uppercase font-bold tracking-wider">Indo-Optimize</span>
                <div 
                  className={cn("w-8 h-4 rounded-full relative cursor-pointer transition-colors", autoTranslate ? "bg-neon-teal" : "bg-white/20")}
                  onClick={() => setAutoTranslate(!autoTranslate)}
                >
                  <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", autoTranslate ? "left-4.5" : "left-0.5")} />
                </div>
              </div>
            </label>
            <GlowTextArea 
              placeholder="Contoh: Seekor kucing astronot sedang melayang di stasiun luar angkasa dengan latar belakang bumi..."
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="text-sm"
            />
            <p className="text-[10px] text-white/40 mt-1 text-right">
                {autoTranslate ? "✨ Prompt akan diterjemahkan ke Inggris otomatis" : "Mode manual (Raw Input)"}
            </p>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <GlossySelect 
              label="Gaya Visual (Style)" 
              value={style}
              onChange={(e) => setStyle(e.target.value as IdeogramStyle)}
            >
              <option value="AUTO">Auto (Recommended)</option>
              <option value="REALISTIC">Realistic / Foto Asli</option>
              <option value="DESIGN">Design / Tipografi</option>
              <option value="RENDER_3D">3D Render</option>
              <option value="ANIME">Anime</option>
              <option value="GENERAL">General</option>
            </GlossySelect>

            <GlossySelect 
              label="Kecepatan Render" 
              value={speed}
              onChange={(e) => setSpeed(e.target.value as IdeogramSpeed)}
            >
              <option value="BALANCED">Balanced (Seimbang)</option>
              <option value="FAST">Fast (Cepat)</option>
              <option value="QUALITY">Quality (Kualitas Tinggi)</option>
            </GlossySelect>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase">Ukuran Gambar</label>
              <div className="grid grid-cols-3 gap-2">
                {RATIO_OPTIONS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setImageSize(ratio.id)}
                    className={cn(
                      "py-2 rounded-lg border text-xs font-medium transition-all",
                      imageSize === ratio.id 
                        ? "bg-neon-teal/20 border-neon-teal text-white shadow-[0_0_10px_rgba(0,243,255,0.2)]" 
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-white/60 uppercase">Ideogram Magic Expand</label>
                    <GlossyToggle label="" checked={expandPrompt} onChange={setExpandPrompt} />
                </div>
                <p className="text-[10px] text-white/30">Biarkan Ideogram memperkaya prompt Anda lebih lanjut.</p>
            </div>
          </div>

          <NeonButton 
            fullWidth 
            className="mt-4 h-12"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Generate Image
              </span>
            )}
          </NeonButton>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </HolographicCard>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-8">
        <HolographicCard className="h-full min-h-[500px] flex items-center justify-center p-2 relative group bg-black/40 border-white/10">
          {resultImage ? (
            <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center bg-black animate-in fade-in duration-700">
              <img 
                src={resultImage} 
                alt="Generated Result" 
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
              
              {/* Overlay Actions */}
              <div className="absolute bottom-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
                <a 
                  href={resultImage} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" /> Fullscreen
                </a>
                <a 
                  href={resultImage} 
                  download="ideogram-result.png"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-teal text-black hover:bg-white transition-colors font-bold"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>

              {/* Show Optimized Prompt Info */}
              {optimizedPrompt && (
                <div className="absolute top-4 left-4 right-4 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[10px] text-neon-teal font-bold uppercase mb-1">Optimized Prompt (English)</p>
                    <p className="text-xs text-white/80 line-clamp-2">{optimizedPrompt}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isGenerating ? (
                <GenerationLoader progress={progress} estimatedTime={15} />
              ) : (
                <div className="flex flex-col items-center opacity-50">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 rotate-3 group-hover:rotate-0 transition-all duration-500">
                    <Sparkles className="w-12 h-12 text-white/30" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Image Studio</h3>
                  <p className="text-white/40 text-sm mt-2 max-w-sm text-center">
                    Masukkan prompt dalam <b>Bahasa Indonesia</b> di panel kiri. AI akan otomatis menerjemahkan dan membuatnya menjadi nyata.
                  </p>
                </div>
              )}
            </div>
          )}
        </HolographicCard>
      </div>
    </div>
  );
};
