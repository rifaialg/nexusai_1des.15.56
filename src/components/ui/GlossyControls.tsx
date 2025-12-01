import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface GlossySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const GlossySelect: React.FC<GlossySelectProps> = ({ className, label, children, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            "w-full appearance-none bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm text-white outline-none transition-all duration-300",
            "hover:border-neon-teal/50 focus:border-neon-teal focus:shadow-neon-teal/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
      </div>
    </div>
  );
};

interface GlossySliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: string | number;
}

export const GlossySlider: React.FC<GlossySliderProps> = ({ className, label, valueDisplay, ...props }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center px-1">
        {label && <label className="text-xs uppercase tracking-wider text-white/60 font-medium">{label}</label>}
        {valueDisplay && <span className="text-xs font-mono text-neon-cyan">{valueDisplay}</span>}
      </div>
      <input
        type="range"
        className={cn(
          "w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer overflow-hidden",
          "accent-neon-teal hover:accent-neon-cyan",
          className
        )}
        {...props}
      />
    </div>
  );
};

interface GlossyToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const GlossyToggle: React.FC<GlossyToggleProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
      <span className="text-sm font-medium text-white/80">{label}</span>
      <div className={cn(
        "w-12 h-6 rounded-full relative transition-colors duration-300",
        checked ? "bg-neon-teal/20 border border-neon-teal" : "bg-white/10 border border-white/20"
      )}>
        <div className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center",
          checked ? "left-[calc(100%-1.25rem)] bg-neon-teal text-black" : "left-1 bg-white/40"
        )}>
          {checked && <Check className="w-2.5 h-2.5" />}
        </div>
      </div>
    </div>
  );
};
