import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet, useLocation } from 'react-router-dom';

export const AppLayout = () => {
  const location = useLocation();
  
  const getTitle = () => {
    switch(location.pathname) {
      case '/nexvideo': return 'NexVideo Generator';
      case '/ads': return 'Ads Studio';
      case '/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <Sidebar />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        {/* Background Glows */}
        <div className="fixed top-0 left-64 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <Header title={getTitle()} />
        <div className="flex-1 p-6 overflow-y-auto z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
