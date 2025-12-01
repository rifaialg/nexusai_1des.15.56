import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { soraService } from '../../services/soraService';
import { HolographicCard } from '../ui/HolographicCard';
import { GlowTextArea } from '../ui/GlowInput';
import { NeonButton } from '../ui/NeonButton';
import { VideoPlayer } from '../ui/VideoPlayer';
import { CircularProgressLoader } from '../ui/CircularProgressLoader'; // Import Loader Baru
import { 
  Wand2, Film, Loader2, Download, 
  X, Settings, Video, Sparkles, RefreshCw,
  Image as ImageIcon, UploadCloud, Zap, AlertTriangle, Play, CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';

// --- Tipe Data Database ---
interface DBVideo {
  id: string;
  task_id: string;
  prompt: string;
  status: 'waiting' | 'processing' | 'success' | 'fail';
  video_url: string | null;
  created_at: string;
  meta_data: {
    aspectRatio?: string;
    duration?: string;
    category?: string;
    sourceImageUrl?: string;
    error?: string; // Menyimpan pesan error spesifik
    [key: string]: any;
  };
}

export const NexVideoContainer: React.FC = () => {
  const { getKey, toast } = useAI();
  const { user } = useAuth();
  
  // --- Input State ---
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('portrait'); 
  const [duration, setDuration] = useState('10');
  
  // --- Reference Image State (WAJIB) ---
  const [refImage, setRefImage] = useState<File | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Process State ---
  const [currentVideo, setCurrentVideo] = useState<DBVideo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(0); // Local progress state for smooth animation

  // Polling Ref
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // --- SUPABASE REALTIME SUBSCRIPTION ---
  useEffect(() => {
    if (!currentVideo) return;

    // Subscribe ke perubahan pada row video saat ini
    const channel = supabase
      .channel(`video-updates-${currentVideo.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_videos',
          filter: `id=eq.${currentVideo.id}`
        },
        (payload) => {
          console.log('🔔 Realtime Update:', payload);
          const newData = payload.new as DBVideo;
          
          // Update state lokal agar UI sinkron
          setCurrentVideo(newData);

          // Notifikasi jika sukses via Realtime (misal diupdate oleh tab lain/worker)
          if (newData.status === 'success' && newData.video_url && currentVideo.status !== 'success') {
            toast.show('✨ Video berhasil dibuat! (Realtime)', 'success');
            setProgressValue(100);
          }
          
          // Jika gagal
          if (newData.status === 'fail' && currentVideo.status !== 'fail') {
            const errorMsg = newData.meta_data?.error || 'Generasi video gagal.';
            toast.show(errorMsg, 'error');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentVideo?.id, toast]); // Re-subscribe hanya jika ID berubah

  // --- Helper: Upload Image to Supabase ---
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    
    // --- ROBUST MIME TYPE DETECTION ---
    let mimeType = file.type;
    const fileNameLower = file.name.toLowerCase();

    // Peta Ekstensi ke MIME Type
    const extToMime: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };

    // Jika mimeType kosong atau octet-stream, coba deteksi dari ekstensi file
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = fileNameLower.split('.').pop();
      if (ext && extToMime[ext]) {
        mimeType = extToMime[ext];
        console.log(`MIME type detected from extension .${ext}: ${mimeType}`);
      } else {
        mimeType = 'image/png'; // Default fallback aman
        console.warn("MIME Type unknown, defaulting to image/png");
      }
    }

    // Tentukan ekstensi file untuk penyimpanan di Supabase
    // Kita gunakan ekstensi standar berdasarkan MIME type yang sudah dipastikan
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    
    const fileExt = mimeToExt[mimeType] || 'png';

    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // FIX: Explicitly set contentType to prevent "File type not supported" error
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
         throw new Error("Bucket 'uploads' tidak ditemukan di Supabase.");
      }
      // Handle RLS/Permission errors specifically
      if (uploadError.message.includes('row-level security') || (uploadError as any).statusCode === '403') {
        throw new Error("Izin ditolak (RLS). Pastikan kebijakan storage sudah diterapkan via SQL.");
      }
      throw uploadError;
    }

    // FIX: Use createSignedUrl to support Private Buckets
    const { data, error: signError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(filePath, 3600); // 1 hour validity

    if (signError || !data?.signedUrl) throw signError || new Error("Gagal membuat Signed URL");
    
    return data.signedUrl;
  };

  // --- Polling Logic (Client-side Worker) ---
  useEffect(() => {
    const checkStatus = async () => {
      if (!currentVideo) return;
      
      // Stop polling jika sudah final
      if (currentVideo.status === 'success' && currentVideo.video_url) {
        setProgressValue(100);
        return;
      }
      if (currentVideo.status === 'fail') return;

      const apiKey = getKey('sora');
      
      try {
        // Demo Mode Logic
        if (currentVideo.task_id.startsWith('demo_')) {
          const elapsed = Date.now() - new Date(currentVideo.created_at).getTime();
          const demoProgress = Math.min(99, Math.floor((elapsed / 15000) * 100));
          setProgressValue(demoProgress);
          
          if (elapsed > 15000 && currentVideo.status !== 'success') {
             const demoUrl = 'https://cdn.pixabay.com/video/2023/09/24/182082-867762079_large.mp4';
             
             // Update DB -> Realtime akan mentrigger update UI
             await supabase.from('generated_videos').update({ status: 'success', video_url: demoUrl }).eq('id', currentVideo.id);
             setProgressValue(100);
          } else if (elapsed > 5000 && currentVideo.status === 'waiting') {
             await supabase.from('generated_videos').update({ status: 'processing' }).eq('id', currentVideo.id);
          }
          return;
        }

        if (!apiKey) return;

        // Real API Check
        const statusData = await soraService.getTaskStatus(apiKey, currentVideo.task_id);
        
        // Update Progress from API
        if (statusData.progress) {
            setProgressValue(statusData.progress);
        } else {
            // Fallback simulation if API doesn't return progress
            setProgressValue(prev => Math.min(prev + 2, 95));
        }
        
        // Jika status API berbeda dengan DB, update DB
        if (statusData.state !== currentVideo.status) {
           // Jika gagal, simpan alasan errornya
           const updatePayload: any = { status: statusData.state };
           if (statusData.state === 'fail') {
             updatePayload.meta_data = { ...currentVideo.meta_data, error: statusData.failReason || statusData.failMsg || 'Unknown error' };
           }

           await supabase.from('generated_videos').update(updatePayload).eq('id', currentVideo.id);
           
           // Update local state untuk responsivitas instan
           setCurrentVideo(prev => prev ? ({ ...prev, ...updatePayload }) : null);
        }

        if (statusData.state === 'success') {
          const finalUrl = statusData.resultUrls?.[0] || (statusData.resultJson as any)?.video_url || (statusData.resultJson as any)?.resultUrls?.[0];
          
          if (finalUrl && finalUrl !== currentVideo.video_url) {
             await supabase.from('generated_videos').update({ status: 'success', video_url: finalUrl }).eq('id', currentVideo.id);
             setCurrentVideo(prev => prev ? ({ ...prev, status: 'success', video_url: finalUrl }) : null);
             setProgressValue(100);
             toast.show('Video selesai!', 'success');
          }
        }

        if (statusData.state === 'fail') {
             const errorMsg = statusData.failReason || statusData.failMsg || 'Unknown error';
             toast.show('Generasi gagal: ' + errorMsg, 'error');
        }

      } catch (error) {
        console.error(`Error polling task:`, error);
      }
    };

    if (currentVideo && (currentVideo.status === 'waiting' || currentVideo.status === 'processing' || (currentVideo.status === 'success' && !currentVideo.video_url))) {
      pollingInterval.current = setInterval(checkStatus, 4000);
    } else {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }

    return () => { if (pollingInterval.current) clearInterval(pollingInterval.current); };
  }, [currentVideo, getKey, toast]);

  // --- Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.show("Mohon unggah file gambar yang valid (JPG/PNG).", 'error');
        return;
      }
      setRefImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setRefImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    const apiKey = getKey('sora');
    if (!apiKey) return toast.show("API Key Sora belum diatur.", 'error');
    if (!prompt.trim()) return toast.show("Prompt tidak boleh kosong.", 'error');
    if (!refImage) return toast.show("Gambar referensi WAJIB diunggah.", 'error');
    if (!user) return;

    setIsGenerating(true);
    setProgressValue(0); // Reset progress

    try {
      // 1. Upload Image
      setUploadProgress(true);
      let publicImageUrl = '';
      
      try {
        publicImageUrl = await uploadImageToSupabase(refImage);
      } catch (uploadErr: any) {
        console.warn("Upload Failed (switching to demo mode):", uploadErr);
        // Jika gagal upload karena permission/bucket, kita bisa fallback ke demo atau throw error
        // Untuk production, throw error lebih baik. Untuk demo, fallback.
        if (uploadErr.message.includes('RLS') || uploadErr.message.includes('Bucket')) {
             throw uploadErr;
        }
        publicImageUrl = "https://file.aiquickdraw.com/custom-page/akr/section-images/17594315607644506ltpf.jpg"; 
        toast.show("Gagal upload, menggunakan mode demo.", 'info');
      }
      setUploadProgress(false);
      setProgressValue(10); // Upload done

      // 2. Create Task
      let taskId: string;
      try {
        taskId = await soraService.createTask(apiKey, {
          prompt: prompt,
          image_urls: [publicImageUrl],
          aspect_ratio: aspectRatio as any,
          n_frames: duration as any,
          remove_watermark: true
        });
      } catch (apiError: any) {
        const errMsg = apiError.message?.toLowerCase() || '';
        if (errMsg.includes('insufficient') || errMsg.includes('credit') || errMsg.includes('404')) {
          taskId = `demo_${Date.now()}`;
          toast.show("Mode Demo Aktif (Simulasi).", "info");
        } else {
          throw apiError;
        }
      }

      // 3. Insert DB
      const newVideo: DBVideo = {
        id: crypto.randomUUID(),
        task_id: taskId,
        prompt: prompt,
        status: 'waiting',
        video_url: null,
        created_at: new Date().toISOString(),
        meta_data: { 
          aspectRatio, 
          duration,
          sourceImageUrl: publicImageUrl
        }
      };

      const { error } = await supabase.from('generated_videos').insert({
        user_id: user.id,
        ...newVideo
      });

      if (error) throw error;
      
      setCurrentVideo(newVideo);
      toast.show("Tugas dimulai! Menunggu hasil...", 'success');

    } catch (error: any) {
      toast.show(error.message || "Gagal membuat tugas video.", 'error');
    } finally {
      setIsGenerating(false);
      setUploadProgress(false);
    }
  };

  const handleReset = () => {
    setCurrentVideo(null);
    setPrompt('');
    setRefImage(null);
    setRefImagePreview(null);
    setProgressValue(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:h-[calc(100vh-140px)] p-4">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        
        {/* --- PANEL KIRI: CONFIGURATION --- */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4">
          {/* ... (Bagian Konfigurasi Kiri Tetap Sama) ... */}
          <div className="bg-[#0a0a12] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl h-full overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white text-shadow-glow">Sora Studio</h2>
                  <p className="text-[10px] text-white/50">Image-to-Video Gen 2</p>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                title="Reset Form"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Image (WAJIB) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-neon-teal" />
                  Gambar Sumber
                </label>
                <span className="text-[10px] bg-neon-teal/20 text-neon-teal px-2 py-0.5 rounded border border-neon-teal/30 font-bold">WAJIB</span>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group",
                  refImagePreview 
                    ? "border-neon-teal/50 bg-black" 
                    : "border-white/10 bg-[#151520] hover:border-white/30 hover:bg-white/5"
                )}
              >
                {refImagePreview ? (
                  <>
                    <img src={refImagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-xs text-white font-medium flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-full border border-white/20">
                        <RefreshCw className="w-3 h-3" /> Ganti Gambar
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6 text-white/30 group-hover:text-neon-teal transition-colors" />
                    </div>
                    <p className="text-xs text-white/70 font-medium">Klik atau Drag Gambar ke Sini</p>
                    <p className="text-[10px] text-white/30 mt-1">JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={handleImageUpload} 
                />
              </div>
            </div>

            {/* Video Prompt */}
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-neon-purple" />
                <label className="text-sm font-medium text-white">Prompt Gerakan</label>
              </div>
              <GlowTextArea 
                placeholder="Contoh: Kamera zoom in perlahan, karakter tersenyum dan melambaikan tangan, pencahayaan sinematik..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-sm bg-[#151520] border-white/10 focus:border-neon-purple rounded-xl resize-none flex-1 min-h-[100px]"
              />
            </div>

            {/* Aspect Ratio Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Rasio Aspek</label>
              <div className="relative">
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full appearance-none bg-[#151520] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-all cursor-pointer hover:bg-white/5"
                >
                  <option value="portrait">Portrait (9:16) - TikTok/Reels</option>
                  <option value="landscape">Landscape (16:9) - YouTube</option>
                  <option value="square">Square (1:1) - Feed</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
              </div>
            </div>

            {/* Generate Button */}
            <NeonButton 
              fullWidth 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !refImage || (currentVideo?.status === 'waiting' || currentVideo?.status === 'processing')}
              className="h-14 mt-auto bg-gradient-to-r from-neon-purple to-neon-teal border-none text-white font-bold shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40"
            >
              {isGenerating || (currentVideo?.status === 'waiting' || currentVideo?.status === 'processing') ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> 
                  {uploadProgress ? 'Mengunggah Gambar...' : 'Sedang Memproses...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Buat Video Ajaib
                </span>
              )}
            </NeonButton>
          </div>
        </div>

        {/* --- PANEL KANAN: GENERATED VIDEO (SINGLE VIEW) --- */}
        <div className="flex-1 flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-neon-teal" />
            <h2 className="text-lg font-bold text-white text-shadow-glow">Hasil Generasi</h2>
            {currentVideo && (
                <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ml-2",
                    currentVideo.status === 'success' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                    currentVideo.status === 'fail' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    "bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse"
                )}>
                    {currentVideo.status === 'waiting' ? 'Menunggu' : 
                     currentVideo.status === 'processing' ? 'Memproses' : 
                     currentVideo.status === 'success' ? 'Selesai' : 'Gagal'}
                </span>
            )}
          </div>

          <div className="flex-1 bg-[#0a0a12] border border-white/10 rounded-2xl p-1 relative overflow-hidden flex items-center justify-center shadow-2xl">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} 
            />

            {/* TOP RIGHT BADGE (Persistent during loading) */}
            {currentVideo && (currentVideo.status === 'waiting' || currentVideo.status === 'processing') && (
              <div className="absolute top-6 right-6 z-50">
                <div className="bg-[#1e293b] border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                  <Loader2 className="w-4 h-4 text-neon-teal animate-spin" />
                  <span className="text-xs font-bold text-neon-teal">Memproses {Math.round(progressValue)}%</span>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              
              {/* STATE 1: LOADING / PROCESSING (NEW CIRCULAR LOADER) */}
              {currentVideo && (currentVideo.status === 'waiting' || currentVideo.status === 'processing') ? (
                <div className="z-10">
                  <CircularProgressLoader progress={progressValue} />
                </div>
              ) 
              
              /* STATE 2: SUCCESS WITH VIDEO */
              : currentVideo && currentVideo.status === 'success' && currentVideo.video_url ? (
                <div className="relative w-full h-full flex flex-col animate-in fade-in zoom-in duration-500">
                   <div className={cn(
                     "relative flex-1 rounded-xl overflow-hidden bg-black shadow-2xl border border-white/5 mx-auto",
                     aspectRatio === 'portrait' ? 'aspect-[9/16] max-h-full' : 
                     aspectRatio === 'square' ? 'aspect-square max-h-full' : 'aspect-video w-full'
                   )}>
                     <VideoPlayer 
                        src={currentVideo.video_url} 
                        className="w-full h-full object-cover" 
                        autoPlay={true} 
                     />
                   </div>
                   <div className="mt-4 flex justify-center gap-4">
                      <a 
                        href={currentVideo.video_url} 
                        download 
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-teal text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
                      >
                        <Download className="w-5 h-5" /> Unduh Video
                      </a>
                      <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10"
                      >
                        <RefreshCw className="w-5 h-5" /> Buat Baru
                      </button>
                   </div>
                </div>
              ) 

              /* STATE 3: FAILED */
              : currentVideo && currentVideo.status === 'fail' ? (
                <div className="flex flex-col items-center gap-4 z-10 max-w-md text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Proses Gagal</h3>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 w-full">
                    <p className="text-sm text-red-300 font-mono break-words">
                      {currentVideo.meta_data?.error || "Terjadi kesalahan tidak dikenal pada server."}
                    </p>
                  </div>
                  <p className="text-white/40 text-sm">
                    Pastikan gambar Anda valid dan kredit API mencukupi.
                  </p>
                  <NeonButton 
                    onClick={handleGenerate} 
                    className="mt-2 bg-white/10 hover:bg-white/20 border-white/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
                  </NeonButton>
                </div>
              )
              
              /* STATE 4: PREVIEW REFERENCE IMAGE */
              : refImagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className={cn(
                    "relative rounded-xl overflow-hidden bg-black shadow-2xl border border-white/5",
                    aspectRatio === 'portrait' ? 'aspect-[9/16] h-full' : 
                    aspectRatio === 'square' ? 'aspect-square h-full' : 'aspect-video w-full'
                  )}>
                    <img 
                      src={refImagePreview} 
                      alt="Preview Output" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs text-white/70 border border-white/10 shadow-lg">
                        Pratinjau Gambar Sumber
                      </span>
                    </div>
                  </div>
                </div>
              ) 
              
              /* STATE 5: EMPTY STATE */
              : (
                <div className="text-center text-white/20 z-10">
                  <Film className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-bold text-white/40">Area Pratinjau</h3>
                  <p className="text-sm mt-2">Unggah gambar di panel kiri untuk memulai.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
