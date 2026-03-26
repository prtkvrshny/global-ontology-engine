import React from 'react';
import { Home, Share2, Activity, Globe, Settings, LogOut, Sun, Moon, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'graph', icon: Share2, label: 'Intelligence' }, 
  { id: 'feeds', icon: Activity, label: 'Feeds' },
  { id: 'mastergraph', icon: BarChart3, label: 'Master Graph' },
  { id: 'climate', icon: Globe, label: 'Climate' },
];

export function Sidebar({ currentView, setCurrentView, onOpenSettings, onLogout, theme, setTheme }) {
  return (
    <nav className="bottom-dock bento-card">
      <div className="dock-items">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={clsx('dock-item', currentView === id && 'active')}
            onClick={() => setCurrentView(id)}
          >
            <Icon size={22} className="dock-icon" />
            <span className="dock-label">{label}</span>
          </button>
        ))}
        
        <div className="dock-divider"></div>

        <button className="dock-item" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={22} className="dock-icon" /> : <Moon size={22} className="dock-icon" />}
        </button>

        <button className="dock-item" onClick={onOpenSettings}>
          <Settings size={22} className="dock-icon" />
          <span className="dock-label">Settings</span>
        </button>
        <button className="dock-item danger" onClick={onLogout}>
          <LogOut size={22} className="dock-icon" />
          <span className="dock-label">Logout</span>
        </button>
      </div>
    </nav>
  );
}
