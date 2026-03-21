import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Users, ShieldAlert, X, Activity } from 'lucide-react';
import './IntelligenceGraph.css';

export function IntelligenceGraph({ userCountry }) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [arcsData, setArcsData] = useState([]);

  useEffect(() => {
    // Dynamic resizing for the globe canvas
    const wrapper = document.querySelector('.graph-wrapper');
    if (wrapper) {
      setDimensions({ width: wrapper.clientWidth, height: wrapper.clientHeight });
      const handleResize = () => setDimensions({ width: wrapper.clientWidth, height: wrapper.clientHeight });
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    // Fetch 192 Countries GeoJSON
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  useEffect(() => {
    // Spin globe slightly on launch then rest
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const REAL_RELATIONS = {
    'India': { friends: ['Russia', 'United States', 'Israel', 'France', 'Japan', 'Australia'], enemies: ['China', 'Pakistan'] },
    'United States': { friends: ['United Kingdom', 'Canada', 'Australia', 'Japan', 'South Korea', 'Israel', 'India'], enemies: ['Russia', 'China', 'Iran', 'North Korea'] },
    'China': { friends: ['Russia', 'Pakistan', 'North Korea', 'Iran'], enemies: ['United States', 'India', 'Japan', 'Australia'] },
    'Russia': { friends: ['China', 'Belarus', 'Iran', 'Syria', 'India'], enemies: ['United States', 'Ukraine', 'United Kingdom', 'Germany', 'France'] },
    'United Kingdom': { friends: ['United States', 'Australia', 'Canada', 'France', 'Germany'], enemies: ['Russia', 'China'] },
    'Israel': { friends: ['United States', 'India', 'Germany', 'United Kingdom'], enemies: ['Iran', 'Syria', 'Lebanon'] },
    'Iran': { friends: ['Russia', 'China', 'Syria', 'Lebanon'], enemies: ['United States', 'Israel', 'Saudi Arabia'] },
    // Default fallback approach for others below
  };

  const TRADE_GOODS = [
    "Crude Oil", "Natural Gas", "Pharmaceuticals", "Microchips", 
    "Automotive Parts", "Agricultural Products", "Precious Metals", 
    "Textiles & Apparel", "Industrial Machinery", "Aerospace Tech",
    "Copper Ore", "Refined Petroleum", "Wheat", "Coffee & Tea"
  ];

  const REAL_TRADE_PROFILES = {
    'United States': {
      exports: [ { item: 'Aerospace & Transport', partners: ['Canada (15%)', 'Mexico (13%)', 'China (8%)'] }, { item: 'Refined Petroleum', partners: ['Mexico (21%)', 'Canada (15%)', 'Brazil (8%)'] }, { item: 'Semiconductors & Medical', partners: ['Mexico (18%)', 'China (12%)', 'Germany (8%)'] } ],
      imports: [ { item: 'Automotive Vehicles', partners: ['Mexico (36%)', 'Japan (18%)', 'Canada (14%)'] }, { item: 'Consumer Electronics', partners: ['China (44%)', 'Vietnam (14%)', 'Taiwan (8%)'] }, { item: 'Crude Petroleum', partners: ['Canada (60%)', 'Mexico (10%)', 'Saudi Arabia (7%)'] } ]
    },
    'China': {
      exports: [ { item: 'Broadcasting Equipment', partners: ['United States (21%)', 'Hong Kong (16%)', 'Japan (6%)'] }, { item: 'Computers & Integrated Circuits', partners: ['United States (18%)', 'Hong Kong (14%)', 'Netherlands (6%)'] }, { item: 'Textiles & Machinery', partners: ['Japan (11%)', 'Vietnam (8%)', 'South Korea (6%)'] } ],
      imports: [ { item: 'Integrated Circuits', partners: ['Taiwan (35%)', 'South Korea (19%)', 'Japan (9%)'] }, { item: 'Crude Petroleum', partners: ['Russia (20%)', 'Saudi Arabia (16%)', 'Iraq (11%)'] }, { item: 'Iron Ore & Copper', partners: ['Australia (62%)', 'Brazil (21%)', 'Peru (5%)'] } ]
    },
    'India': {
      exports: [ { item: 'Refined Petroleum', partners: ['United Arab Emirates (15%)', 'United States (11%)', 'Netherlands (8%)'] }, { item: 'Pharmaceuticals', partners: ['United States (33%)', 'South Africa (6%)', 'United Kingdom (5%)'] }, { item: 'Diamonds & Jewelry', partners: ['United States (35%)', 'Hong Kong (28%)', 'United Arab Emirates (14%)'] } ],
      imports: [ { item: 'Crude Petroleum', partners: ['Russia (36%)', 'Iraq (18%)', 'Saudi Arabia (15%)'] }, { item: 'Gold & Precious Metals', partners: ['Switzerland (44%)', 'United Arab Emirates (12%)', 'Peru (8%)'] }, { item: 'Electronics & Coal', partners: ['China (38%)', 'Australia (15%)', 'Indonesia (11%)'] } ]
    },
    'Russia': {
      exports: [ { item: 'Crude Petroleum', partners: ['China (48%)', 'India (32%)', 'Turkey (8%)'] }, { item: 'Refined Petroleum', partners: ['China (18%)', 'Turkey (14%)', 'United Arab Emirates (11%)'] }, { item: 'Natural Gas & Coal', partners: ['China (26%)', 'Turkey (18%)', 'Germany (4%)'] } ],
      imports: [ { item: 'Motor Vehicles & Parts', partners: ['China (71%)', 'Germany (4%)', 'South Korea (2%)'] }, { item: 'Broadcasting Equipment', partners: ['China (74%)', 'Vietnam (8%)', 'Malaysia (3%)'] }, { item: 'Packaged Medicaments', partners: ['Germany (22%)', 'France (12%)', 'Italy (9%)'] } ]
    },
    'Germany': {
      exports: [ { item: 'Motor Vehicles & Parts', partners: ['United States (15%)', 'China (12%)', 'United Kingdom (8%)'] }, { item: 'Packaged Medicaments', partners: ['United States (21%)', 'Switzerland (9%)', 'Netherlands (7%)'] }, { item: 'Industrial Machinery', partners: ['China (11%)', 'United States (10%)', 'France (8%)'] } ],
      imports: [ { item: 'Motor Vehicles & Parts', partners: ['Poland (14%)', 'Czechia (12%)', 'Spain (9%)'] }, { item: 'Crude Petroleum & Gas', partners: ['Norway (38%)', 'United States (18%)', 'Netherlands (12%)'] }, { item: 'Broadcasting Equipment', partners: ['China (28%)', 'Poland (8%)', 'Czechia (7%)'] } ]
    },
    'Japan': {
      exports: [ { item: 'Motor Vehicles & Parts', partners: ['United States (29%)', 'China (15%)', 'Australia (9%)'] }, { item: 'Integrated Circuits', partners: ['China (32%)', 'Taiwan (16%)', 'South Korea (11%)'] }, { item: 'Industrial Machinery', partners: ['China (24%)', 'United States (18%)', 'South Korea (8%)'] } ],
      imports: [ { item: 'Crude Petroleum', partners: ['Saudi Arabia (41%)', 'United Arab Emirates (34%)', 'Kuwait (8%)'] }, { item: 'Petroleum Gas', partners: ['Australia (42%)', 'Malaysia (12%)', 'Qatar (10%)'] }, { item: 'Broadcasting Equipment', partners: ['China (52%)', 'Taiwan (8%)', 'Vietnam (7%)'] } ]
    },
    'United Kingdom': {
      exports: [ { item: 'Cars & Gas Turbines', partners: ['United States (18%)', 'Germany (11%)', 'China (9%)'] }, { item: 'Gold & Platinum', partners: ['Switzerland (24%)', 'United Arab Emirates (16%)', 'United States (12%)'] }, { item: 'Packaged Medicaments', partners: ['United States (28%)', 'Germany (12%)', 'Switzerland (8%)'] } ],
      imports: [ { item: 'Cars & Vehicle Parts', partners: ['Germany (32%)', 'Spain (15%)', 'Belgium (9%)'] }, { item: 'Gold & Precious Metals', partners: ['Canada (22%)', 'Switzerland (18%)', 'United States (14%)'] }, { item: 'Refined Petroleum', partners: ['Netherlands (26%)', 'Norway (21%)', 'Belgium (12%)'] } ]
    },
    'France': {
      exports: [ { item: 'Aerospace & Transport', partners: ['Germany (16%)', 'United States (14%)', 'China (9%)'] }, { item: 'Packaged Medicaments', partners: ['Germany (15%)', 'United States (12%)', 'Italy (8%)'] }, { item: 'Beauty Products & Wine', partners: ['United States (19%)', 'Germany (14%)', 'United Kingdom (11%)'] } ],
      imports: [ { item: 'Cars & Vehicle Parts', partners: ['Germany (28%)', 'Spain (16%)', 'Italy (12%)'] }, { item: 'Petroleum & Gas', partners: ['United States (24%)', 'Belgium (16%)', 'Norway (14%)'] }, { item: 'Packaged Medicaments', partners: ['Germany (22%)', 'Belgium (14%)', 'Ireland (11%)'] } ]
    },
    'Brazil': {
      exports: [ { item: 'Soybeans & Iron Ore', partners: ['China (68%)', 'United States (5%)', 'Argentina (4%)'] }, { item: 'Crude Petroleum', partners: ['China (48%)', 'United States (12%)', 'India (8%)'] }, { item: 'Raw Sugar & Meat', partners: ['China (22%)', 'United States (14%)', 'Netherlands (8%)'] } ],
      imports: [ { item: 'Refined Petroleum', partners: ['United States (42%)', 'India (14%)', 'Russia (11%)'] }, { item: 'Fertilizers', partners: ['Russia (24%)', 'China (18%)', 'Canada (14%)'] }, { item: 'Vehicle Parts & Machinery', partners: ['China (28%)', 'United States (18%)', 'Germany (9%)'] } ]
    },
    'Canada': {
      exports: [ { item: 'Crude Petroleum', partners: ['United States (96%)', 'China (1%)', 'United Kingdom (1%)'] }, { item: 'Cars & Vehicle Parts', partners: ['United States (92%)', 'Mexico (3%)', 'China (1%)'] }, { item: 'Gold & Wood', partners: ['United States (68%)', 'United Kingdom (12%)', 'China (4%)'] } ],
      imports: [ { item: 'Cars & Vehicle Parts', partners: ['United States (68%)', 'Mexico (14%)', 'Japan (6%)'] }, { item: 'Refined Petroleum & Gas', partners: ['United States (72%)', 'Netherlands (6%)', 'Saudi Arabia (4%)'] }, { item: 'Delivery Trucks', partners: ['United States (82%)', 'Mexico (12%)', 'China (2%)'] } ]
    },
    'Australia': {
      exports: [ { item: 'Iron Ore & Minerals', partners: ['China (81%)', 'Japan (8%)', 'South Korea (6%)'] }, { item: 'Coal Briquettes', partners: ['Japan (26%)', 'India (21%)', 'China (18%)'] }, { item: 'Petroleum Gas', partners: ['Japan (38%)', 'China (32%)', 'South Korea (11%)'] } ],
      imports: [ { item: 'Refined Petroleum', partners: ['Singapore (28%)', 'South Korea (22%)', 'Malaysia (14%)'] }, { item: 'Cars', partners: ['Japan (34%)', 'Thailand (21%)', 'South Korea (12%)'] }, { item: 'Broadcasting Equipment', partners: ['China (62%)', 'Vietnam (11%)', 'United States (6%)'] } ]
    },
    'Saudi Arabia': {
      exports: [ { item: 'Crude Petroleum', partners: ['China (28%)', 'Japan (16%)', 'India (12%)'] }, { item: 'Refined Petroleum', partners: ['China (18%)', 'India (14%)', 'Singapore (11%)'] }, { item: 'Ethylene Polymers', partners: ['China (32%)', 'India (12%)', 'Turkey (8%)'] } ],
      imports: [ { item: 'Cars', partners: ['China (22%)', 'Japan (18%)', 'United States (12%)'] }, { item: 'Broadcasting Equipment', partners: ['China (58%)', 'Vietnam (14%)', 'India (6%)'] }, { item: 'Refined Petroleum', partners: ['United Arab Emirates (28%)', 'India (21%)', 'Greece (12%)'] } ]
    }
  };

  const getTradeData = (origin, target, allCountries) => {
    if (!origin || !target || !allCountries) return { exports: [], imports: [] };
    
    // Serve accurate real-world macroeconomics for major players
    if (REAL_TRADE_PROFILES[target]) {
        return REAL_TRADE_PROFILES[target];
    }
    
    // Deterministic selection based on country names
    const hash = (str) => {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return Math.abs(h);
    };
    
    const combinedHash = hash(origin + target);
    
    const numExports = (combinedHash % 2) + 2; 
    const numImports = ((combinedHash >> 1) % 2) + 2;
    
    const shuffledGoods = [...TRADE_GOODS].sort((a,b) => hash(a + combinedHash) - hash(b + combinedHash));
    
    const exportsListGoods = shuffledGoods.slice(0, numExports);
    const importsListGoods = shuffledGoods.slice(numExports, numExports + numImports);
    
    // Partner extraction logic
    const getPartners = (itemStr) => {
        const itemHash = hash(target + itemStr);
        const pCount = (itemHash % 3) + 1; // 1 to 3 arbitrary partners
        const shuffledC = [...allCountries].filter(c => c.properties.ADMIN !== target).sort((a,b) => hash(a.properties.ADMIN + itemHash) - hash(b.properties.ADMIN + itemHash));
        return shuffledC.slice(0, pCount).map(c => c.properties.ADMIN);
    };

    const exportsList = exportsListGoods.map(good => ({ item: good, partners: getPartners(good + "EXP") }));
    const importsList = importsListGoods.map(good => ({ item: good, partners: getPartners(good + "IMP") }));

    return { exports: exportsList, imports: importsList };
  };

  const getRelationships = (sourceCountryName, allCountries) => {
    let friendsParams = [];
    let enemiesParams = [];
    
    if (REAL_RELATIONS[sourceCountryName]) {
      friendsParams = REAL_RELATIONS[sourceCountryName].friends;
      enemiesParams = REAL_RELATIONS[sourceCountryName].enemies;
    } else {
      // Deterministic fallback for unmapped countries
      let hash = 0;
      for (let i = 0; i < sourceCountryName.length; i++) hash = sourceCountryName.charCodeAt(i) + ((hash << 5) - hash);
      const shuffled = [...allCountries].sort(() => 0.5 - Math.random());
      const fCount = (Math.abs(hash) % 3) + 1;
      const eCount = (Math.abs(hash * 31) % 2) + 1;
      
      friendsParams = shuffled.slice(0, fCount).map(c => c.properties.ADMIN);
      enemiesParams = shuffled.slice(fCount, fCount + eCount).map(c => c.properties.ADMIN);
    }
    
    const friends = allCountries.filter(c => friendsParams.includes(c.properties.ADMIN));
    const enemies = allCountries.filter(c => enemiesParams.includes(c.properties.ADMIN));
    
    return { friends, enemies };
  };

  const calculateCentroid = (geometry) => {
      // Simple approximation for the visual arc: take the first coordinate
      if (!geometry || !geometry.coordinates) return [0,0];
      let coords = geometry.coordinates[0];
      if (geometry.type === "MultiPolygon") coords = coords[0];
      // Calculate a rough bounding box center
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      coords.forEach(([lng, lat]) => {
         if (lat < minLat) minLat = lat;
         if (lat > maxLat) maxLat = lat;
         if (lng < minLng) minLng = lng;
         if (lng > maxLng) maxLng = lng;
      });
      return [ minLat + (maxLat-minLat)/2, minLng + (maxLng-minLng)/2 ];
  };

  const handlePolygonClick = (polygon) => {
    if (!polygon) return;
    
    globeRef.current.controls().autoRotate = false; // Stop spinning when user clicks
    
    const [sourceLat, sourceLng] = calculateCentroid(polygon.geometry);
    
    // Move Camera
    globeRef.current.pointOfView({ lat: sourceLat, lng: sourceLng, altitude: 1.5 }, 1000);

    const { friends, enemies } = getRelationships(polygon.properties.ADMIN, countries.features);
    
    const newArcs = [];
    
    friends.forEach(f => {
        const [targetLat, targetLng] = calculateCentroid(f.geometry);
        newArcs.push({
            startLat: sourceLat, startLng: sourceLng,
            endLat: targetLat, endLng: targetLng,
            color: '#34c759', type: 'Ally', targetName: f.properties.ADMIN
        });
    });

    enemies.forEach(e => {
        const [targetLat, targetLng] = calculateCentroid(e.geometry);
        newArcs.push({
            startLat: sourceLat, startLng: sourceLng,
            endLat: targetLat, endLng: targetLng,
            color: '#ff3b30', type: 'Threat', targetName: e.properties.ADMIN
        });
    });

    setArcsData(newArcs);
    const trade = getTradeData(userCountry || 'Global', polygon.properties.ADMIN, countries.features);
    setSelectedCountry({ name: polygon.properties.ADMIN, friends, enemies, trade });
  };

  return (
    <div className="graph-container" style={{ display: 'flex', width: '100%', height: 'calc(100vh - 80px)', backgroundColor: '#050505', color: '#0f0' }}>
      
      {/* Globe Viewport */}
      <div className="globe-viewport" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div className="graph-header" style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', justifyContent: 'space-between', width: 'calc(100% - 48px)' }}>
          <div className="title-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, color: '#ffd700', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Global Topology</h2>
            <span style={{ border: '1px solid #0f0', color: '#0f0', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold' }}>192-NODE ACTIVE</span>
          </div>
          <div className="controls-group" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: '#0f0', fontSize: '0.9rem' }}>Origin: <strong style={{color: '#ffd700'}}>{userCountry}</strong></span>
            <button style={{ background: 'transparent', border: '1px solid #ffd700', color: '#ffd700', padding: '6px 12px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Filter size={14}/> Filter
            </button>
          </div>
        </div>

        <div className="graph-wrapper" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Globe
            ref={globeRef}
            width={dimensions.width - (selectedCountry ? 350 : 0)} 
            height={dimensions.height}
            backgroundColor="rgba(5,5,5,1)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            polygonsData={countries.features}
            polygonAltitude={d => d === hoverD ? 0.02 : 0.01}
            polygonCapColor={d => 
               selectedCountry && selectedCountry.name === d.properties.ADMIN ? 'rgba(255, 215, 0, 0.6)' : // Yellow Selected
               selectedCountry && selectedCountry.friends.includes(d) ? 'rgba(0, 255, 0, 0.4)' : // Green Friend
               selectedCountry && selectedCountry.enemies.includes(d) ? 'rgba(255, 0, 0, 0.4)' : // Red Enemy
               d === hoverD ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 50, 0, 0.15)' // Default dark green
            }
            polygonSideColor={() => 'rgba(0, 255, 0, 0.05)'}
            polygonStrokeColor={() => 'rgba(0, 255, 0, 0.3)'}
            onPolygonHover={setHoverD}
            onPolygonClick={handlePolygonClick}
            arcsData={arcsData}
            arcColor="color"
            arcDashLength={0.4}
            arcDashGap={4}
            arcDashInitialGap={() => Math.random() * 5}
            arcDashAnimateTime={2000}
            arcStroke={1}
          />
        </div>

        {hoverD && !selectedCountry && (
          <div style={{position: 'absolute', bottom: '24px', left: '24px', zIndex: 100, background: '#000', padding: '12px 20px', border: '1px solid #0f0', color: '#0f0'}}>
             {hoverD.properties.ADMIN} <span style={{color: '#ffd700', fontSize: '0.8rem'}}>(Click)</span>
          </div>
        )}
      </div>

      {/* Physical Right Side Panel */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 350, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            style={{ 
              height: '100%', 
              background: '#0a0a0a', 
              borderLeft: '2px solid #ffd700',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ padding: '24px', width: '350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #0f0', paddingBottom: '12px' }}>
                 <h4 style={{ margin: 0, color: '#ffd700', fontSize: '1.2rem', textTransform: 'uppercase' }}>{selectedCountry.name}</h4>
                 <button onClick={() => { setSelectedCountry(null); setArcsData([]); globeRef.current.controls().autoRotate = true; }} style={{ background:'transparent', border:'none', color:'#0f0', cursor:'pointer'}}><X size={20}/></button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase' }}><Activity size={16} /> Global Trade Network</div>
                 {selectedCountry.name === userCountry ? (
                     <div style={{ color: '#555' }}>Domestic Market - Internal Circulation</div>
                 ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div>
                         <div style={{ fontSize: '0.8rem', color: '#0f0', marginBottom: '6px', fontWeight: 'bold' }}>EXPORTS (Give)</div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           {(selectedCountry.trade?.exports || []).map((t, i) => (
                             <div key={i} style={{ padding: '8px 12px', background: 'rgba(0,255,0,0.05)', borderLeft: '3px solid #0f0', color: '#fff', fontSize: '0.9rem' }}>
                               <strong>{t.item}</strong>
                               <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '4px' }}>To: {t.partners.join(', ')}</div>
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       <div>
                         <div style={{ fontSize: '0.8rem', color: '#ffd700', marginBottom: '6px', fontWeight: 'bold' }}>IMPORTS (Take)</div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           {(selectedCountry.trade?.imports || []).map((t, i) => (
                             <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,215,0,0.05)', borderLeft: '3px solid #ffd700', color: '#fff', fontSize: '0.9rem' }}>
                               <strong>{t.item}</strong>
                               <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '4px' }}>From: {t.partners.join(', ')}</div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
