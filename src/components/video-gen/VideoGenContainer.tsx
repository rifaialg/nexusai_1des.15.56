import React, { useState, useEffect } from 'react';
import { useSoraGeneration } from '../../hooks/useSoraGeneration';
import { SoraAspectRatio, SoraDuration, VideoHistoryItem } from '../../types/sora';
import { HolographicCard } from '../ui/HolographicCard';
import { GlowTextArea } from '../ui/GlowInput';
import { GlossySelect, GlossyToggle } from '../ui/GlossyControls';
import { NeonButton } from '../ui/NeonButton';
import { VideoPlayer } from '../ui/VideoPlayer';
import { 
  Wand2, AlertCircle, Film, Loader2, Clock, Layout, 
  Sparkles, History, Play, Download, Trash2, Monitor, Smartphone, Square,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const VISUAL_STYLES = [
  { id: 'none', label: 'No Style (Raw)' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'anime', label: 'Anime / Manga' },
  { id: '3d-render', label: '3D Render (Unreal Engine)' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'vintage', label: 'Vintage Film' },
];

export const VideoGenContainer: React.FC = () => {
  // Input States
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<SoraAspectRatio>('portrait'); // Default changed to 9:16
  const [duration, setDuration] = useState<SoraDuration>('10');
  const [style, setStyle] = useState('cinematic');
  const [removeWatermark, setRemoveWatermark] = useState(true);
  
  // History State
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);

  // Custom Hook for Logic
  const { 
    status, 
    resultUrl, 
    error, 
    progress, 
    generateVideo 
  } = useSoraGeneration();

  // Load History on Mount
  useEffect(() => {
    const saved = localStorage.getItem('SORA_HISTORY');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  // Save to History when successful
  useEffect(() => {
    if (status === 'success' && resultUrl) {
      const newItem: VideoHistoryItem = {
        id: Date.now().toString(),
        prompt: prompt,
        videoUrl: resultUrl,
        timestamp: Date.now(),
        aspectRatio,
        style
      };
      
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('SORA_HISTORY', JSON.stringify(updatedHistory));
    }
  }, [status, resultUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    let finalPrompt = prompt;
    if (style !== 'none') {
      const styleLabel = VISUAL_STYLES.find(s => s.id === style)?.label;
      finalPrompt = `${styleLabel} style, ${prompt}`;
    }

    generateVideo({
      prompt: finalPrompt,
      aspect_ratio: aspectRatio,
      n_frames: duration,
      remove_watermark: removeWatermark
    });
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('SORA_HISTORY', JSON.stringify(updated));
  };

  const isLoading = status === 'creating' || status === 'polling';

  return (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:h-[calc(100vh-140px)]">
      {/* Main Layout Container */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* --- LEFT PANEL: CONTROLS --- */}
        <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col gap-4 lg:overflow-y-auto custom-scrollbar pb-10 lg:pb-2">
          <HolographicCard className="p-5 md:p-6 space-y-6 border-neon-purple/20">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-purple to-indigo-600 flex items-center justify-center shadow-lg shadow-neon-purple/20">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Sora Generator</h2>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                  v2.0 Turbo Model
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-white">Prompt</label>
                <span className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                  prompt.length > 1800 
                    ? "text-red-400 border-red-500/30 bg-red-500/10" 
                    : "text-neon-teal border-neon-teal/30 bg-neon-teal/10"
                )}>
                  {prompt.length}/2000
                </span>
              </div>
              <div className="relative group">
                <GlowTextArea 
                  placeholder="Describe your video imagination in detail..."
                  rows={6}
                  maxLength={2000}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="text-sm leading-relaxed min-h-[120px] resize-none"
                />
                <div className="absolute bottom-3 right-3">
                  <div className="p-1.5 rounded-lg bg-white/5 text-white/30 hover:text-neon-purple transition-colors cursor-help" title="AI Magic Enhance (Coming Soon)">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="space-y-5">
              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'landscape', icon: Monitor, label: '16:9', desc: 'Cinema' },
                    { id: 'portrait', icon: Smartphone, label: '9:16', desc: 'Social' },
                    { id: 'square', icon: Square, label: '1:1', desc: 'Feed' }
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as SoraAspectRatio)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 min-h-[80px] group overflow-hidden",
                        aspectRatio === ratio.id 
                          ? "bg-neon-purple/10 border-neon-purple text-white shadow-[0_0_15px_rgba(188,19,254,0.2)]" 
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20"
                      )}
                    >
                      <ratio.icon className={cn(
                        "w-6 h-6 mb-2 transition-transform duration-300",
                        aspectRatio === ratio.id ? "scale-110 text-neon-purple" : "group-hover:scale-110"
                      )} />
                      <span className="text-xs font-bold">{ratio.label}</span>
                      <span className="text-[10px] opacity-50">{ratio.desc}</span>
                      
                      {/* Active Indicator */}
                      {aspectRatio === ratio.id && (
                        <div className="absolute inset-0 border-2 border-neon-purple rounded-xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlossySelect 
                  label="Visual Style" 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="h-11"
                >
                  {VISUAL_STYLES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </GlossySelect>

                <GlossySelect 
                  label="Duration" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as SoraDuration)}
                  className="h-11"
                >
                  <option value="10">10 Seconds</option>
                  <option value="15">15 Seconds</option>
                </GlossySelect>
              </div>

              <GlossyToggle 
                label="Remove Watermark" 
                checked={removeWatermark}
                onChange={setRemoveWatermark}
              />
            </div>

            {/* Generate Button */}
            <div className="pt-2 sticky bottom-0 z-10">
              <NeonButton 
                fullWidth 
                size="lg"
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={cn(
                  "h-14 text-lg shadow-xl transition-all duration-500",
                  isLoading ? "opacity-90 cursor-wait" : "hover:scale-[1.02]"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-bold">Generating...</span>
                      <span className="text-[10px] opacity-70 font-mono">{status === 'creating' ? 'Initializing' : `${progress}% Complete`}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Video
                  </>
                )}
              </NeonButton>
              
              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-200 text-xs animate-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </HolographicCard>

          {/* Info Card */}
          <div className="hidden lg:flex bg-white/5 border border-white/10 rounded-xl p-4 gap-3 items-start">
            <div className="p-2 bg-neon-teal/10 rounded-lg text-neon-teal">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Pro Tip</h4>
              <p className="text-xs text-white/50 mt-1">
                Use "Cinematic" style with "16:9" ratio for best movie-like results. 
                Generation usually takes 2-5 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: PREVIEW & HISTORY --- */}
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-hidden">
          
          {/* Main Preview Area */}
          <HolographicCard className="flex-[2] min-h-[350px] lg:min-h-0 flex flex-col p-0 bg-black/60 border-white/10 relative group overflow-hidden">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-widest uppercase">Live Preview</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative flex items-center justify-center">
              {resultUrl ? (
                <VideoPlayer src={resultUrl} className="w-full h-full max-h-full" />
              ) : (
                <div className="text-center p-8 max-w-md relative z-10">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-40 h-40 mb-8">
                        {/* Complex Loader Animation */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/5 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full border-2 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-4 rounded-full border-2 border-b-neon-teal border-t-transparent border-r-transparent border-l-transparent animate-[spin_2s_linear_infinite_reverse]" />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-full m-6 border border-white/10">
                          <span className="text-3xl font-bold text-white font-mono">{progress}%</span>
                          <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Rendering</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white animate-pulse">Synthesizing Reality...</h3>
                        <p className="text-white/40 text-sm">
                          Our AI is crafting your scene frame by frame. <br/>
                          <span className="text-neon-teal">Estimated time: ~3 mins</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-40 group-hover:opacity-80 transition-all duration-500 transform group-hover:scale-105">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-white/5 to-white/10 flex items-center justify-center mb-6 border border-white/10 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform">
                        <Layout className="w-10 h-10 text-white/50" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Canvas Ready</h3>
                      <p className="text-white/50 text-sm max-w-xs">
                        Configure your parameters on the left panel and bring your imagination to life.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Background Grid Effect */}
              {!resultUrl && (
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} 
                />
              )}
            </div>
          </HolographicCard>

          {/* History Section */}
          <div className="h-[220px] flex flex-col gap-3 flex-shrink-0">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-neon-teal" /> 
                Recent Creations
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/60">{history.length}</span>
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to clear your video history?')) {
                      setHistory([]);
                      localStorage.removeItem('SORA_HISTORY');
                    }
                  }}
                  className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02] text-center p-6">
                  <Film className="w-8 h-8 text-white/10 mb-3" />
                  <p className="text-sm text-white/30 font-medium">Your generated videos will appear here</p>
                </div>
              ) : (
                <div className="flex gap-4 h-full">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="relative flex-shrink-0 w-[280px] h-full rounded-2xl overflow-hidden border border-white/10 group bg-black shadow-lg hover:border-neon-teal/50 transition-all duration-300"
                    >
                      <video 
                        src={item.videoUrl} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                        muted
                        loop
                        onMouseOver={e => e.currentTarget.play()}
                        onMouseOut={e => e.currentTarget.pause()}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur text-[10px] font-bold text-white border border-white/10">
                              {item.aspectRatio}
                            </span>
                            <span className="text-[10px] text-white/60 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          
                          <p className="text-xs text-white font-medium line-clamp-2 mb-3 text-shadow-sm">
                            {item.prompt}
                          </p>
                          
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            <a 
                              href={item.videoUrl} 
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 bg-neon-teal text-black rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-white transition-colors"
                            >
                              <Play className="w-3 h-3" /> Play
                            </a>
                            <a 
                              href={item.videoUrl} 
                              download={`sora-${item.id}.mp4`}
                              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button 
                              onClick={() => deleteHistoryItem(item.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
