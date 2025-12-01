import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { HolographicCard } from '../../components/ui/HolographicCard';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import { NeonButton } from '../../components/ui/NeonButton';
import { Film, Calendar, Download, Trash2, Play, Copy, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HistoryItem {
  id: string;
  task_id: string;
  prompt: string;
  status: 'waiting' | 'processing' | 'success' | 'fail';
  video_url: string | null;
  created_at: string;
  meta_data: any;
}

export const VideoHistory = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('generated_videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVideos(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    
    // Realtime subscription for updates
    const channel = supabase
      .channel('history_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'generated_videos' }, () => {
        fetchHistory();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus video ini dari riwayat?')) return;
    
    const { error } = await supabase.from('generated_videos').delete().eq('id', id);
    if (!error) {
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Prompt disalin!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-neon-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Riwayat Video</h2>
          <p className="text-white/50">Koleksi video yang telah Anda buat.</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <span className="text-neon-teal font-bold">{videos.length}</span> <span className="text-white/60 text-sm">Video</span>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <Film className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Belum Ada Video</h3>
          <p className="text-white/40 mt-2">Mulai buat video pertama Anda di Generator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {videos.map((video) => (
            <HolographicCard key={video.id} className="group flex flex-col overflow-hidden border-white/10 hover:border-neon-purple/50 transition-all">
              {/* Video Thumbnail / Player */}
              <div className="relative aspect-video bg-black overflow-hidden">
                {video.status === 'success' && video.video_url ? (
                  playingId === video.id ? (
                    <VideoPlayer src={video.video_url} className="w-full h-full" />
                  ) : (
                    <div className="relative w-full h-full group/thumb cursor-pointer" onClick={() => setPlayingId(video.id)}>
                      {/* THUMBNAIL HACK: Start at 1.0s to skip static start */}
                      <video 
                        src={`${video.video_url}#t=1.0`} 
                        className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity" 
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover/thumb:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </div>
                      </div>
                      {/* Badge Ratio */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-bold text-white border border-white/10">
                        {video.meta_data?.aspectRatio || '16:9'}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                    {video.status === 'fail' ? (
                      <div className="text-red-400 flex flex-col items-center">
                        <AlertTriangle className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold">Gagal</span>
                      </div>
                    ) : (
                      <div className="text-neon-teal flex flex-col items-center">
                        <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                        <span className="text-xs font-bold animate-pulse">Memproses...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <Calendar className="w-3 h-3" />
                    {new Date(video.created_at).toLocaleDateString()} • {new Date(video.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                    video.status === 'success' ? "bg-green-500/20 text-green-400" :
                    video.status === 'fail' ? "bg-red-500/20 text-red-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    {video.status}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-xs text-white/80 line-clamp-3 font-medium leading-relaxed" title={video.prompt}>
                    {video.prompt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex gap-2">
                  <button 
                    onClick={() => copyPrompt(video.prompt)}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Prompt
                  </button>
                  
                  {video.status === 'success' && video.video_url && (
                    <a 
                      href={video.video_url} 
                      download 
                      className="flex-1 py-2 rounded-lg bg-neon-teal/10 hover:bg-neon-teal/20 text-xs text-neon-teal font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Unduh
                    </a>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(video.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </HolographicCard>
          ))}
        </div>
      )}
    </div>
  );
};
