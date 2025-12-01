import React from 'react';
import { cn } from '../../lib/utils';
import { Wand2, Layers, ShoppingBag, Scissors } from 'lucide-react';

export type ImageMode = 'text-to-image' | 'merger' | 'product' | 'bg-remover';

interface ImageGenTabsProps {
  activeMode: ImageMode;
  onModeChange: (mode: ImageMode) => void;
}

export const ImageGenTabs: React.FC<ImageGenTabsProps> = ({ activeMode, onModeChange }) => {
  const tabs = [
    { id: 'text-to-image', label: 'AI Generator', icon: Wand2 },
    { id: 'merger', label: 'Photo Merger', icon: Layers },
    { id: 'product', label: 'Product Composite', icon: ShoppingBag },
    { id: 'bg-remover', label: 'BG Remover', icon: Scissors },
  ];

  return (
    <div className="flex overflow-x-auto pb-2 gap-2 mb-6 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeMode === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onModeChange(tab.id as ImageMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border",
              isActive 
                ? "bg-neon-teal/10 border-neon-teal text-neon-teal shadow-[0_0_15px_rgba(0,243,255,0.2)]" 
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
