import React from 'react';
import { Zap, Bell, UserCircle } from 'lucide-react';

export const Header = ({ title }: { title: string }) => {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <h2 className="text-xl font-semibold text-text-primary hidden md:block">{title}</h2>
      
      {/* Mobile Menu Trigger Placeholder */}
      <div className="md:hidden text-lg font-bold text-primary">NEXUSAI</div>

      <div className="flex items-center gap-6">
        {/* Pro Badge */}
        <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 px-3 py-1.5 rounded-full">
          <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-text-primary">Pro Plan</span>
        </div>

        {/* Credits */}
        <div className="text-sm font-medium">
          <span className="text-text-secondary">Balance: </span>
          <span className="text-secondary neon-text-cyan">9,700 Credits</span>
        </div>

        <div className="h-6 w-px bg-border"></div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-text-primary relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-text-primary">user@nexusai.com</p>
            </div>
            <UserCircle className="w-8 h-8 text-text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
};
