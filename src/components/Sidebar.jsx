import React from 'react';
import { Home, Share2, Activity, Settings, Shield, Globe, LogOut, Mic } from 'lucide-react';
import clsx from 'clsx';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'graph', icon: Share2, label: 'Intelligence Graph' },
  { id: 'feeds', icon: Activity, label: 'Live Feeds' },
  { id: 'defense', icon: Shield, label: 'Defense Intel' },
  { id: 'climate', icon: Globe, label: 'Climate & Geo' },
  { id: 'voice', icon: Mic, label: 'Voice Intel' },
];

export function Sidebar({ currentView, setCurrentView, onOpenSettings, onLogout }) {
  return (
    <aside className="global-sidebar glass-panel">
      <div className="brand-section">
        <div className="brand-logo">
          <div className="logo-orb"></div>
        </div>
        <h2 className="brand-title">GOE Core</h2>
      </div>

      <nav className="nav-menu">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={clsx('nav-item', currentView === id && 'active')}
            onClick={() => setCurrentView(id)}
          >
            <Icon size={20} className="nav-icon" />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={onOpenSettings}>
          <Settings size={20} className="nav-icon" />
          <span className="nav-label">Settings</span>
        </button>
        <button className="nav-item" onClick={onLogout} style={{color: '#ff3b30', marginTop: '4px'}}>
          <LogOut size={20} className="nav-icon" />
          <span className="nav-label">End Session</span>
        </button>
      </div>
    </aside>
  );
}
