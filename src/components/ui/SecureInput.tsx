import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({ className, label, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={isVisible ? "text" : "password"}
          className={cn(
            "w-full bg-black/40 border border-surface-border rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/30 outline-none transition-all duration-300 font-mono text-sm",
            "focus:border-neon-teal focus:shadow-glow-ring focus:bg-black/60",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-neon-teal hover:bg-white/5 transition-colors"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
