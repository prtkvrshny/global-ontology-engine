import React from 'react';
import { ShieldAlert, Crosshair, Map, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import './DefenseIntel.css';

const threatRegions = [
  { region: 'Middle East', level: 'Elevated', activeUnits: 142, color: '#f59e0b' },
  { region: 'Asia', level: 'Critical', activeUnits: 256, color: '#ff3b30' },
  { region: 'North America', level: 'Nominal', activeUnits: 34, color: '#34c759' },
];

export function DefenseIntel() {
  return (
    <div className="defense-container">
      <header className="page-header">
        <h1>Defense Intel Command</h1>
        <p>Strategic overview of global military postures and threat vectors.</p>
      </header>

      <div className="defense-grid">
        <motion.div className="radar-module glass-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="module-header">
            <Crosshair size={20} className="text-red" />
            <h3>Strategic Radar</h3>
          </div>
          <div className="radar-display">
            <div className="radar-sweep"></div>
            <div className="blip b1"></div>
            <div className="blip b2"></div>
            <div className="blip b3"></div>
          </div>
        </motion.div>

        <motion.div className="threat-list glass-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="module-header">
            <ShieldAlert size={20} className="text-amber" />
            <h3>Regional Threat Posture</h3>
          </div>
          <div className="regions">
            {threatRegions.map((t, idx) => (
              <div key={idx} className="region-card">
                <div className="rc-info">
                  <h4>{t.region}</h4>
                  <span className="rc-units">{t.activeUnits} Tracked Units</span>
                </div>
                <div className="rc-status" style={{ color: t.color, borderColor: t.color }}>
                  {t.level}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
