import React from 'react';
import { 
  Megaphone, Settings, Sparkles, CloudLightning
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ToolType = 'nexvideo' | 'ads' | 'settings';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick,
  isNew = false,
  isPro = false
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick?: () => void,
  isNew?: boolean,
  isPro?: boolean
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
      active 
        ? "text-white bg-white/10 shadow-[0_0_15px_rgba(0,243,255,0.1)]" 
        : "text-white/50 hover:text-white hover:bg-white/5"
    )}
  >
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-teal shadow-[0_0_10px_#00f3ff]" />
    )}
    <Icon className={cn("w-5 h-5 transition-colors", active ? "text-neon-teal" : "group-hover:text-white")} />
    <span className={cn("font-medium text-sm flex-1 text-left", active && "text-shadow-glow")}>{label}</span>
    {isNew && (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-purple text-white shadow-neon-purple">NEW</span>
    )}
    {isPro && (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-black">PRO</span>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeTool, onToolChange }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-[#050510]/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-neon-purple">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">NEXUS<span className="text-neon-teal">AI</span></h1>
            <p className="text-[10px] text-white/40 tracking-widest uppercase">Creative Suite</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <div className="px-4 py-2 text-xs font-bold text-white/30 uppercase tracking-wider">Tools</div>
          <NavItem 
            icon={CloudLightning} 
            label="NexVideo Generator" 
            active={activeTool === 'nexvideo'} 
            onClick={() => onToolChange('nexvideo')}
            isNew
            isPro
          />
          
          <div className="px-4 py-2 mt-6 text-xs font-bold text-white/30 uppercase tracking-wider">Professional</div>
          <NavItem icon={Megaphone} label="Ads Studio" onClick={() => onToolChange('ads')} active={activeTool === 'ads'} />
          <NavItem icon={Settings} label="Settings" onClick={() => onToolChange('settings')} active={activeTool === 'settings'} />
        </div>
      </aside>
    </>
  );
};
