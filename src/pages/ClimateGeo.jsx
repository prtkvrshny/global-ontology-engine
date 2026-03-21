import React from 'react';
import { Globe, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { motion } from 'framer-motion';
import './ClimateGeo.css';

export function ClimateGeo() {
  return (
    <div className="climate-container">
      <header className="page-header">
        <h1>Climate & Geospatial</h1>
        <p>Earth observation parameters and environmental anomaly tracking.</p>
      </header>

      <div className="climate-grid">
        <motion.div className="metric-card glass-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <ThermometerSun size={24} className="metric-icon" style={{color: '#ff9500'}} />
          <div className="metric-data">
            <h4>Global Temp Anomaly</h4>
            <div className="value positive">+1.24°C</div>
            <p>vs Pre-industrial Baseline</p>
          </div>
        </motion.div>

        <motion.div className="metric-card glass-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Wind size={24} className="metric-icon" style={{color: '#06b6d4'}} />
          <div className="metric-data">
            <h4>Atmospheric CO2</h4>
            <div className="value">421.1 ppm</div>
            <p>Mauna Loa Observatory</p>
          </div>
        </motion.div>

        <motion.div className="metric-card glass-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Droplets size={24} className="metric-icon" style={{color: '#3b82f6'}} />
          <div className="metric-data">
            <h4>Sea Level Rise</h4>
            <div className="value positive">+3.4 mm/yr</div>
            <p>Global Average</p>
          </div>
        </motion.div>
      </div>
      
      <motion.div className="geo-heatmap-placeholder glass-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
         <div className="heatmap-header">
            <h3>Geospatial Thermal Mapping</h3>
         </div>
         <div className="heatmap-viz" style={{padding: 0}}>
            <iframe 
              src="https://earth.nullschool.net/#current/wind/surface/level/overlay=temp/orthographic=-0.01,0.00,300"
              style={{width: '100%', height: '100%', border: 'none', borderRadius: '12px'}}
              title="Live Thermal Mapping"
            ></iframe>
         </div>
      </motion.div>
    </div>
  );
}
