import React, { useState, useEffect } from 'react';
import { Globe, Droplets, Wind, ThermometerSun } from 'lucide-react';
import { motion } from 'framer-motion';
import './ClimateGeo.css';

export function ClimateGeo({ userCountry }) {
  const [climate, setClimate] = useState(null);

  useEffect(() => {
    const fetchClimate = async () => {
      const countryCoords = {
         'United States': { lat: 38.0, lng: -97.0 },
         'China': { lat: 35.0, lng: 105.0 },
         'India': { lat: 20.0, lng: 77.0 },
         'Russia': { lat: 60.0, lng: 100.0 },
         'United Kingdom': { lat: 55.0, lng: -3.0 },
         'Germany': { lat: 51.0, lng: 9.0 },
         'Japan': { lat: 36.0, lng: 138.0 }
      };
      
      const coords = countryCoords[userCountry] || { lat: 0, lng: 0 }; // Default equator/global metric
      
      try {
         const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
         const data = await res.json();
         if (data.current) {
             setClimate(data.current);
         }
      } catch (err) {
         console.error('Meteo API Failed:', err);
      }
    };
    
    fetchClimate();
    const interval = setInterval(fetchClimate, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
  }, [userCountry]);

  return (
    <div className="climate-container">
      <header className="page-header">
        <h1>{userCountry ? `${userCountry} Regional Climate` : 'Global Climate & Geospatial'}</h1>
        <p>Live, real-time meteorological arrays sourced directly from atmospheric arrays.</p>
      </header>

      <div className="climate-grid">
        <motion.div className="metric-card bento-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <ThermometerSun size={24} className="metric-icon" style={{color: '#ff9500'}} />
          <div className="metric-data">
            <h4>Current Avg Temp</h4>
            <div className="value">{climate ? `${climate.temperature_2m}°C` : '--'}</div>
            <p>Surface Observation</p>
          </div>
        </motion.div>

        <motion.div className="metric-card bento-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Droplets size={24} className="metric-icon" style={{color: '#06b6d4'}} />
          <div className="metric-data">
            <h4>Relative Humidity</h4>
            <div className="value">{climate ? `${climate.relative_humidity_2m}%` : '--'}</div>
            <p>Atmospheric Saturation</p>
          </div>
        </motion.div>

        <motion.div className="metric-card bento-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Wind size={24} className="metric-icon" style={{color: '#3b82f6'}} />
          <div className="metric-data">
            <h4>Surface Wind Speed</h4>
            <div className="value">{climate ? `${climate.wind_speed_10m} km/h` : '--'}</div>
            <p>10m Anemometer Array</p>
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
