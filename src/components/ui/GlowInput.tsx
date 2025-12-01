import React from 'react';
import { cn } from '../../lib/utils';

interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const GlowInput: React.FC<GlowInputProps> = ({ className, icon, ...props }) => {
  return (
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-neon-teal transition-colors">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full bg-black/40 border border-surface-border rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all duration-300",
          "focus:border-neon-teal focus:shadow-glow-ring focus:bg-black/60",
          icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  );
};

export const GlowTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "w-full bg-black/40 border border-surface-border rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all duration-300 resize-none",
        "focus:border-neon-teal focus:shadow-glow-ring focus:bg-black/60",
        className
      )}
      {...props}
    />
  );
};
