import React from 'react';
import { StoryboardScene } from '../../types/storyboard';
import { cn } from '../../lib/utils';

interface TimelineProps {
  scenes: StoryboardScene[];
  totalDuration: number;
  targetDuration: number;
}

const ROLE_COLORS: Record<string, string> = {
  Hook: 'bg-red-500',
  Problem: 'bg-orange-500',
  Solution: 'bg-green-500',
  Proof: 'bg-blue-500',
  CTA: 'bg-purple-500',
  default: 'bg-gray-500'
};

export const Timeline: React.FC<TimelineProps> = ({ scenes, totalDuration, targetDuration }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-white/60 font-mono">
        <span>0s</span>
        <span>Target: {targetDuration}s</span>
        <span>Total: {totalDuration}s</span>
      </div>
      
      <div className="h-8 bg-white/5 rounded-lg overflow-hidden flex border border-white/10 relative">
        {scenes.map((scene, idx) => {
          const widthPercent = (scene.duration / Math.max(totalDuration, targetDuration)) * 100;
          const colorClass = ROLE_COLORS[scene.role] || ROLE_COLORS.default;
          
          return (
            <div 
              key={scene.id}
              style={{ width: `${widthPercent}%` }}
              className={cn(
                "h-full border-r border-black/20 relative group transition-all hover:brightness-110",
                colorClass
              )}
              title={`${scene.role}: ${scene.duration}s`}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[9px] font-bold text-white text-shadow-sm transition-opacity overflow-hidden whitespace-nowrap">
                {scene.role}
              </div>
            </div>
          );
        })}
        
        {/* Target Marker */}
        {totalDuration < targetDuration && (
          <div 
            className="absolute top-0 bottom-0 w-px bg-white/30 border-r border-dashed border-white/50"
            style={{ left: `${(targetDuration / Math.max(totalDuration, targetDuration)) * 100}%` }}
          />
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(ROLE_COLORS).map(([role, color]) => (
          role !== 'default' && (
            <div key={role} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", color)} />
              <span className="text-[10px] text-white/40">{role}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
