import React from 'react';
import { cn } from '../../lib/utils';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary',
  fullWidth = false,
  ...props 
}) => {
  return (
    <button 
      className={cn(
        "relative group overflow-hidden rounded-xl px-6 py-3 font-semibold transition-all duration-300 active:scale-95",
        fullWidth ? "w-full" : "w-auto",
        variant === 'primary' 
          ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg hover:shadow-neon-purple" 
          : "bg-transparent border border-neon-teal/50 text-neon-teal hover:bg-neon-teal/10 hover:shadow-neon-teal",
        className
      )}
      {...props}
    >
      {/* Ripple/Glow effect overlay */}
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
