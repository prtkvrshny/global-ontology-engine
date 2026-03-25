import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { Dashboard } from './pages/Dashboard';
import { IntelligenceGraph } from './pages/IntelligenceGraph';
import { DataFeeds } from './pages/DataFeeds';
import { ClimateGeo } from './pages/ClimateGeo';
import { MasterGraph } from './pages/MasterGraph';
import { VoiceIntel } from './pages/VoiceIntel';
import { Login } from './pages/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCountry, setUserCountry] = useState(null);
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = (country) => {
    setUserCountry(country);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserCountry(null);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userCountry={userCountry} />;
      case 'graph':
        return <IntelligenceGraph userCountry={userCountry} theme={theme} />;
      case 'feeds':
        return <DataFeeds userCountry={userCountry} />;
      case 'mastergraph':
        return <MasterGraph userCountry={userCountry} />;
      case 'climate':
        return <ClimateGeo userCountry={userCountry} />;
      case 'voice':
        return <VoiceIntel userCountry={userCountry} />;
      default:
        return <Dashboard userCountry={userCountry} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
      />
      
      <main className="main-content">
        <div className="top-nav">
          <div className="nav-breadcrumbs">
            <span>GOE Core</span>
            <span className="separator">/</span>
            <span className="current-path">
              {currentView === 'graph' ? 'Intelligence Graph' : 
               currentView === 'feeds' ? 'Live Feeds' :
               currentView === 'mastergraph' ? 'Master Graph' :
               currentView === 'climate' ? 'Climate & Geo' : 
               currentView === 'voice' ? 'Voice System' : 'Dashboard'}
            </span>
          </div>
          <div className="user-profile">
            <div className="profile-status"></div>
            <div className="user-designation" style={{color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600}}>
               {userCountry} Operative
            </div>
            <img src={`https://ui-avatars.com/api/?name=${userCountry}&background=0D8ABC&color=fff`} alt="User" className="avatar" />
          </div>
        </div>

        <div className="view-container">
          {renderView()}
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
