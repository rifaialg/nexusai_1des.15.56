import React from 'react';
import { cn } from '../../lib/utils';

interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({ 
  children, 
  className, 
  hoverEffect = false,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border border-surface-border bg-surface-glass backdrop-blur-md shadow-glass transition-all duration-300",
        hoverEffect && "hover:bg-surface-glassHover hover:border-white/20 hover:shadow-neon-teal/20",
        className
      )}
      {...props}
    >
      {/* Subtle sheen effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
