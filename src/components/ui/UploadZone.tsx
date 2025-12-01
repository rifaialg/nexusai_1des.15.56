import React, { useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { cn } from '../../lib/utils';

export const UploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={cn(
        "relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer",
        isDragging 
          ? "border-neon-teal bg-neon-teal/5 shadow-neon-teal/20 scale-[1.01]" 
          : "border-white/10 hover:border-neon-teal/50 hover:bg-white/5"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
    >
      <div className={cn(
        "w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 transition-all duration-300",
        "group-hover:scale-110 group-hover:bg-neon-teal/20 group-hover:text-neon-teal"
      )}>
        <Upload className="w-8 h-8 text-white/70 group-hover:text-neon-teal" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">Upload Reference Image</h3>
      <p className="text-sm text-white/40">Drag & drop or click to browse</p>
      <p className="text-xs text-white/20 mt-2">Supports JPG, PNG, WEBP up to 10MB</p>
      
      {/* Pulse animation element */}
      <div className="absolute inset-0 rounded-2xl border border-neon-teal/0 group-hover:border-neon-teal/30 group-hover:animate-pulse-slow pointer-events-none" />
    </div>
  );
};
