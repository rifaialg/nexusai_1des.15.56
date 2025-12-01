import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CircularProgressLoaderProps {
  progress: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
}

export const CircularProgressLoader: React.FC<CircularProgressLoaderProps> = ({ 
  progress, 
  size = 180, 
  strokeWidth = 12 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
      {/* Circular Progress */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Container */}
        <svg 
          className="w-full h-full -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track Circle (Background) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/10"
          />
          
          {/* Progress Circle (Foreground) */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-neon-teal drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>

        {/* Percentage Text Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white font-mono tracking-tighter">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Text Info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-neon-teal animate-pulse">
          AI sedang bekerja...
        </h3>
        <p className="text-sm text-white/50 font-medium">
          Estimasi waktu: 2-5 menit
        </p>
      </div>
    </div>
  );
};
