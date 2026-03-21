import React, { useMemo, useState, useEffect } from 'react';
import { Activity, Users, ShieldAlert, TrendingUp, Globe2, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchGdeltData } from '../utils/gdeltFetcher';
import './Dashboard.css';

// Mock Generator for Country-Specific Data
const generateCountryData = (country) => {
  // Use a simple hash to make data consistent per country
  let hash = 0;
  for (let i = 0; i < country.length; i++) {
    hash = country.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const inflation = (Math.abs(hash % 15) + 0.5).toFixed(1);
  const diplomaticScore = Math.abs(hash % 100);
  let status = 'Stable';
  let color = '#34c759';
  if (diplomaticScore < 40) { status = 'Tense'; color = '#ff3b30'; }
  else if (diplomaticScore < 70) { status = 'Developing'; color = '#f59e0b'; }

  return {
    inflation: `${inflation}%`,
    diplomaticStatus: status,
    diplomaticColor: color,
    alliesCount: Math.abs(hash % 50) + 12,
    threatLevel: status === 'Tense' ? 'Elevated (L4)' : 'Nominal (L2)'
  };
};

const getHistoryData = (country) => {
  const histories = {
    'India': [
      { year: '1947', event: 'Independence & Sovereign Establishment' },
      { year: '1991', event: 'Strategic Economic Liberalization' },
      { year: '1998', event: 'Pokhran-II deterrence tests' },
      { year: '2014', event: '"Make in India" manufacturing pivot' },
      { year: '2023', event: 'Chandrayaan-3 lunar landing' },
    ],
    'United States': [
      { year: '1776', event: 'Declaration of Independence' },
      { year: '1945', event: 'Establishment of Global Hegemony' },
      { year: '1969', event: 'Apollo 11 Lunar Landing' },
      { year: '1991', event: 'End of Cold War multi-polarity' },
      { year: '2021', event: 'Indo-Pacific Strategic Pivot' },
    ],
    'China': [
      { year: '1949', event: 'Establishment of PRC' },
      { year: '1978', event: 'Strategic Economic Reforms' },
      { year: '2001', event: 'WTO Integration & Export boom' },
      { year: '2013', event: 'Launch of Belt & Road Initiative' },
      { year: '2023', event: 'Global Tech & AI Manufacturing dominance' },
    ],
    'Russia': [
      { year: '1991', event: 'Formation of the Russian Federation' },
      { year: '2000', event: 'Centralization of State Power' },
      { year: '2008', event: 'Military Modernization Programs' },
      { year: '2014', event: 'Annexation of Crimea' },
      { year: '2022', event: 'Full-scale conventional conflict' },
    ]
  };
  
  return histories[country] || [
    { year: '1950', event: 'Post-war structural reconstruction' },
    { year: '1990', event: 'Digital & economic globalization' },
    { year: '2010', event: 'Expansion of regional cyber capabilities' },
    { year: '2020', event: 'Navigating multi-polar geopolitics' },
    { year: '2024', event: 'Current strategic posture' }
  ];
};

export function Dashboard({ userCountry }) {
  const data = useMemo(() => generateCountryData(userCountry || 'Global'), [userCountry]);
  const historyData = useMemo(() => getHistoryData(userCountry || 'Global'), [userCountry]);
  const [liveNews, setLiveNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const loadNews = async () => {
    setLoadingNews(true);
    const origin = userCountry || 'Global';
    try {
      const articles = await fetchGdeltData(origin, 5);
      const mapped = articles.map((art, i) => ({
         id: i,
         title: art.title,
         type: 'GDELT Intel',
         url: art.url
      }));
      setLiveNews(mapped);
    } catch (err) {
      console.error("Dashboard news error, falling back:", err);
      setLiveNews([
        { id: 1, title: `${origin} implements new domestic cyber protocols.`, type: 'Internal Intel', url: `https://news.google.com/search?q=${encodeURIComponent(origin + ' cyber security')}` },
        { id: 2, title: `Bilateral trade negotiations advance favorably for ${origin}.`, type: 'Economic Intel', url: `https://news.google.com/search?q=${encodeURIComponent(origin + ' trade economy')}` },
        { id: 3, title: `Energy grid stress tests returning nominal in primary ${origin} sectors.`, type: 'Infrastructure', url: `https://news.google.com/search?q=${encodeURIComponent(origin + ' energy infrastructure')}` }
      ]);
    }
    setLoadingNews(false);
  };

  useEffect(() => {
    loadNews();
    const intervalId = setInterval(loadNews, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(intervalId);
  }, [userCountry]);

  const summaryCards = [
    { title: 'Diplomatic Posture', value: data.diplomaticStatus, icon: Globe2, color: data.diplomaticColor },
    { title: 'National Inflation YoY', value: data.inflation, icon: TrendingUp, color: '#06b6d4' },
    { title: 'Registered Allies', value: data.alliesCount, icon: Users, color: '#8b5cf6' },
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>{userCountry ? `${userCountry} Regional Overview` : 'Global Overview'}</h1>
        <p>Real-time localized synthesis of cross-domain intelligence parameters.</p>
      </header>

      <div className="summary-grid">
        {summaryCards.map((card, idx) => (
          <motion.div 
            key={idx}
            className="summary-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="card-header">
              <span className="card-title">{card.title}</span>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div className="card-value" style={{ textShadow: `0 0 10px ${card.color}40`, color: card.color }}>
              {card.value}
            </div>
            <div className="card-sparkline" style={{ background: `linear-gradient(90deg, transparent, ${card.color}20, transparent)` }}></div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <motion.div 
          className="dashboard-module glass-panel large-module"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3>{userCountry ? `${userCountry} Historical Trajectory` : 'Global Historical Trajectory'}</h3>
          <div className="history-graph-container">
             <div className="history-graph-line"></div>
             <div className="history-nodes">
               {historyData.map((node, i) => (
                  <div key={i} className="history-node" style={{ left: `${(i / (historyData.length - 1)) * 100}%` }}>
                     <div className="history-dot"></div>
                     <div className="history-content">
                        <span className="history-year">{node.year}</span>
                        <span className="history-event">{node.event}</span>
                     </div>
                  </div>
               ))}
             </div>
          </div>
        </motion.div>

        <motion.div 
          className="dashboard-module glass-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px'}}>
             <Newspaper size={20} className="text-cyan" />
             <h3 style={{border: 'none', margin: 0, padding: 0}}>Breaking: {userCountry}</h3>
          </div>
          <ul className="alert-list">
            {loadingNews ? (
                <div style={{color: 'var(--text-secondary)', padding: '16px'}}>Tapping Global News Matrix...</div>
            ) : liveNews.map(n => (
              <li key={n.id} className="alert-item low">
                <span className="pulse"></span>
                <span style={{flex: 1}}>
                   <a href={n.url} target="_blank" rel="noopener noreferrer" style={{color: '#fff', textDecoration: 'none'}}>
                     {n.title}
                   </a>
                </span>
                <span style={{fontSize: '0.75rem', opacity: 0.6}}>{n.type}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
