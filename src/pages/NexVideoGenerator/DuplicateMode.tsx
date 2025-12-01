import React, { useState, useRef } from 'react';
import { 
  UploadCloud, Film, Search, Sparkles, 
  CheckCircle2, Clock, Monitor, Music, Type
} from 'lucide-react';
import { HolographicCard } from '../../components/ui/HolographicCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { GlowTextArea } from '../../components/ui/GlowInput';
import { GlossySelect, GlossyToggle } from '../../components/ui/GlossyControls';
import { cn } from '../../lib/utils';

interface DuplicateModeProps {
  onSettingsChange: (settings: any) => void;
}

export const DuplicateMode: React.FC<DuplicateModeProps> = ({ onSettingsChange }) => {
  // State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  
  // Form Data
  const [productName, setProductName] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [language, setLanguage] = useState('indonesia');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  // Settings
  const [model, setModel] = useState('Sora-style');
  const [duration, setDuration] = useState('15');
  const [resolution, setResolution] = useState('1080p');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysisResult(null); // Reset analysis when file changes
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    
    setIsAnalyzing(true);
    
    // Mock Analysis Process
    setTimeout(() => {
      const mockAnalysis = {
        summary: "Video ini menampilkan momen sinematik produk kecantikan dengan pencahayaan softbox.",
        duration: "15s",
        aspectRatio: "9:16",
        tone: "Elegant & Luxury",
        scenes: [
          "Scene 1: Close-up produk dengan background blur.",
          "Scene 2: Model wanita tersenyum mengaplikasikan produk.",
          "Scene 3: Tekstur produk dioleskan di tangan.",
          "Scene 4: Packshot produk dengan teks overlay."
        ]
      };
      
      setAnalysisResult(mockAnalysis);
      
      // Auto-fill prompt
      const autoPrompt = `Cinematic video for ${productName || 'product'}. Style: ${mockAnalysis.tone}. \nSequence: ${mockAnalysis.scenes.join(' ')} \nAdditional details: ${manualDesc}`;
      setGeneratedPrompt(autoPrompt);
      
      // Update parent settings
      onSettingsChange({
        mode: 'duplicate',
        prompt: autoPrompt,
        model,
        duration,
        resolution
      });

      setIsAnalyzing(false);
    }, 2500);
  };

  const handlePromptChange = (val: string) => {
    setGeneratedPrompt(val);
    onSettingsChange({
      mode: 'duplicate',
      prompt: val,
      model,
      duration,
      resolution
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* A. Product Name */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-white">Nama Produk</label>
        <input 
          type="text"
          placeholder="Contoh: Nexus Serum"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-neon-teal outline-none transition-all"
        />
      </div>

      {/* B. Upload Reference */}
      <HolographicCard className="p-5 border-neon-blue/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-neon-blue" /> Video Referensi
          </h3>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">MP4, MOV (Max 100MB)</span>
        </div>

        {!videoPreview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-neon-blue/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-white/30 group-hover:text-neon-blue" />
            </div>
            <p className="text-sm font-medium text-white">Upload Video untuk Ditiru</p>
            <p className="text-xs text-white/40 mt-1">AI akan menganalisis struktur dan gaya video ini</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
            <video src={videoPreview} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
               <button 
                 onClick={() => { setVideoFile(null); setVideoPreview(null); setAnalysisResult(null); }}
                 className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
               >
                 Hapus Video
               </button>
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleFileChange}
        />
      </HolographicCard>

      {/* C. Manual Description & Analysis */}
      <div className="space-y-4">
        <GlowTextArea 
          placeholder="Tambahkan detail yang tidak terlihat di video: musik, durasi pasti, text overlay, dll..."
          value={manualDesc}
          onChange={(e) => setManualDesc(e.target.value)}
          className="text-xs min-h-[80px]"
        />
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setLanguage('indonesia')}
              className={cn("px-3 py-1.5 text-xs rounded-md transition-all", language === 'indonesia' ? "bg-neon-blue text-black font-bold" : "text-white/50")}
            >
              Indonesia
            </button>
            <button 
              onClick={() => setLanguage('english')}
              className={cn("px-3 py-1.5 text-xs rounded-md transition-all", language === 'english' ? "bg-neon-blue text-black font-bold" : "text-white/50")}
            >
              English
            </button>
          </div>

          <NeonButton 
            onClick={handleAnalyze} 
            disabled={!videoFile || isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 animate-spin" /> Menganalisis...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Analisis Video
              </span>
            )}
          </NeonButton>
        </div>
      </div>

      {/* F. Analysis Result */}
      {analysisResult && (
        <HolographicCard className="p-5 border-neon-teal/30 bg-neon-teal/5 animate-in zoom-in-95 duration-300">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-neon-teal flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Analisis Selesai</h4>
              <p className="text-xs text-white/60 mt-1">{analysisResult.summary}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-black/40 p-2 rounded-lg text-center border border-white/5">
              <Clock className="w-3 h-3 text-neon-teal mx-auto mb-1" />
              <span className="text-[10px] text-white/60">Duration</span>
              <p className="text-xs font-bold text-white">{analysisResult.duration}</p>
            </div>
            <div className="bg-black/40 p-2 rounded-lg text-center border border-white/5">
              <Monitor className="w-3 h-3 text-neon-teal mx-auto mb-1" />
              <span className="text-[10px] text-white/60">Ratio</span>
              <p className="text-xs font-bold text-white">{analysisResult.aspectRatio}</p>
            </div>
            <div className="bg-black/40 p-2 rounded-lg text-center border border-white/5">
              <Type className="w-3 h-3 text-neon-teal mx-auto mb-1" />
              <span className="text-[10px] text-white/60">Tone</span>
              <p className="text-xs font-bold text-white truncate">{analysisResult.tone}</p>
            </div>
          </div>

          <div className="space-y-1">
            {analysisResult.scenes.map((scene: string, idx: number) => (
              <div key={idx} className="text-[10px] text-white/70 flex gap-2">
                <span className="text-neon-teal font-bold">{idx + 1}.</span>
                {scene}
              </div>
            ))}
          </div>
        </HolographicCard>
      )}

      {/* G. Generated Prompt */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-white">Prompt Hasil Analisis</label>
          <span className="text-[10px] text-white/40">Dapat diedit</span>
        </div>
        <GlowTextArea 
          value={generatedPrompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          rows={6}
          placeholder="Prompt akan muncul di sini setelah analisis..."
          className="font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <GlossySelect 
          label="AI Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option>Sora-style (KIE AI)</option>
          <option>Veo-style</option>
        </GlossySelect>
        <GlossySelect 
          label="Resolution"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        >
          <option>1080p FHD</option>
          <option>4K UHD</option>
        </GlossySelect>
      </div>

    </div>
  );
};
