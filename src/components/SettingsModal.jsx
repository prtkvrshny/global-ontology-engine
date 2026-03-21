import React from 'react';
import { X, Sliders, ShieldCheck, Database, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SettingsModal.css';

export function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          className="settings-modal glass-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className="modal-header">
            <div className="mh-title">
              <Sliders size={20} className="text-cyan" />
              <h2>System Parameters</h2>
            </div>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="modal-content">
            <div className="settings-section">
               <h3><ShieldCheck size={16} /> Security & Clearance</h3>
               <div className="setting-row">
                 <span>Data Masking Level</span>
                 <select className="setting-select">
                   <option>Standard (Level 2)</option>
                   <option>Strict (Level 1)</option>
                   <option>Unrestricted (Clearance Req)</option>
                 </select>
               </div>
               <div className="setting-row">
                 <span>Auto-Purge Volatile Logs</span>
                 <label className="toggle-switch">
                   <input type="checkbox" defaultChecked />
                   <span className="slider round"></span>
                 </label>
               </div>
            </div>

            <div className="settings-section">
               <h3><Database size={16} /> Data Feeds & Sync</h3>
               <div className="setting-row">
                 <span>Global Sync Frequency</span>
                 <select className="setting-select">
                   <option>Real-time (0ms latency)</option>
                   <option>Batched (5min)</option>
                   <option>Archival (24h)</option>
                 </select>
               </div>
               <div className="setting-row">
                 <span>Include Classified Nodes in Graph</span>
                 <label className="toggle-switch">
                   <input type="checkbox" />
                   <span className="slider round"></span>
                 </label>
               </div>
            </div>

            <div className="settings-section">
               <h3><Zap size={16} /> AI Engine Capabilities</h3>
               <div className="setting-row">
                 <span>Predictive Modeling</span>
                 <label className="toggle-switch">
                   <input type="checkbox" defaultChecked />
                   <span className="slider round"></span>
                 </label>
               </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Discard</button>
            <button className="btn-primary" onClick={onClose}>Apply Configuration</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
