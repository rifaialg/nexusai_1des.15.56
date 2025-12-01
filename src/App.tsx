import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { NexVideoGenerator } from './pages/NexVideoGenerator';
import { VideoHistory } from './pages/VideoHistory';
import { ApiSettings } from './components/settings/ApiSettings';
import { AuthPage } from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AIProvider } from './context/AIContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <AuthPage />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <AIProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/nexvideo" replace />} />
              <Route path="nexvideo" element={<NexVideoGenerator />} />
              <Route path="history" element={<VideoHistory />} />
              <Route path="ads" element={<div className="p-10 text-center text-white/50">Ads Studio Coming Soon</div>} />
              <Route path="settings" element={<ApiSettings />} />
            </Route>
          </Routes>
        </Router>
      </AIProvider>
    </AuthProvider>
  );
}

export default App;
