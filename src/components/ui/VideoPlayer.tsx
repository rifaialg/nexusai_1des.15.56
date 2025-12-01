import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string; // Deprecated: Ignored
  className?: string;
  autoPlay?: boolean;
  startTime?: number; // New prop to skip static start
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  className, 
  autoPlay = true,
  startTime = 0.5 // Default skip 0.5s to avoid static frame
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);

  // Helper to append media fragment for skipping start
  const getProcessedSrc = (originalSrc: string) => {
    if (!originalSrc) return '';
    // If src already has hash, don't append
    if (originalSrc.includes('#t=')) return originalSrc;
    // Append #t=0.5 to skip the first half second (often static in AI videos)
    return `${originalSrc}#t=${startTime}`;
  };

  const processedSrc = getProcessedSrc(src);

  // Handle Autoplay Logic
  useEffect(() => {
    if (videoRef.current && autoPlay) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.log("Autoplay prevented by browser policy:", error);
            setIsPlaying(false);
          });
      }
    }
  }, [src, autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src; // Download original full file
    a.download = `generated-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={cn("relative group rounded-xl overflow-hidden bg-black border border-white/10", className)}>
      <video
        ref={videoRef}
        src={processedSrc}
        className="w-full h-full object-cover"
        loop
        playsInline
        autoPlay={autoPlay}
        muted={isMuted}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        // Ensure we don't show poster
        poster={undefined} 
      />
      
      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="p-2 rounded-full bg-neon-teal/20 text-neon-teal hover:bg-neon-teal hover:text-black transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              title="Unduh Video"
            >
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/70 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button (Only if paused) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};
