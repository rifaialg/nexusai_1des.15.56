import React from 'react';
import { NavLink } from 'react-router-dom';
import { Video, Megaphone, Settings, LogOut, Layers, History } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { signOut } = useAuth();

  const navItems = [
    { name: 'NexVideo Generator', path: '/nexvideo', icon: Video, badge: 'NEW' },
    { name: 'Video History', path: '/history', icon: History },
    { name: 'Ads Studio', path: '/ads', icon: Megaphone },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-border flex flex-col fixed left-0 top-0 z-50 hidden lg:flex">
      {/* Logo Area */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-glow-purple">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">NEXUSAI</h1>
            <p className="text-[10px] text-text-secondary tracking-widest uppercase">Creative Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-glow-purple" 
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.name}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/20">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-text-secondary hover:text-danger transition-colors rounded-xl hover:bg-danger/5"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
