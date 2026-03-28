import React, { useMemo, useState, useEffect } from 'react';
import { Activity, Users, ShieldAlert, TrendingUp, Globe2, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAllCategoryFeeds } from '../utils/gdeltFetcher';
import './Dashboard.css';

// Mock Generator for Country-Specific Data
const generateCountryData = (country) => {
  // Use a simple hash to make data consistent per country
  let hash = 0;
  for (let i = 0; i < country.length; i++) {
    hash = country.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const inflation = "3.21";
  const diplomaticScore = Math.abs(hash % 100);
  let status = 'Stable';
  let color = '#34c759';
  if (diplomaticScore < 40) { status = 'Tense'; color = '#ff3b30'; }
  else if (diplomaticScore < 70) { status = 'Developing'; color = '#f59e0b'; }

  const budgets = {
    'United States': '$997.0 Billion',
    'China': '$314.0 Billion',
    'Russia': '$149.0 Billion',
    'Germany': '$88.5 Billion',
    'India': '$86.1 Billion',
    'United Kingdom': '$81.8 Billion',
    'Saudi Arabia': '$80.3 Billion',
    'France': '$64.7 Billion',
    'Ukraine': '$64.7 Billion',
    'Japan': '$55.3 Billion',
    'South Korea': '$46.8 Billion',
    'Israel': '$46.5 Billion'
  };
  
  const defenseBudget = budgets[country] || `$${Math.abs(hash % 30) + 10}.5 Billion`;

  return {
    inflation: `3.21%`,
    diplomaticStatus: status,
    diplomaticColor: color,
    defenseBudget: defenseBudget,
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
      const feeds = await fetchAllCategoryFeeds(origin);
      const allArticles = [];
      Object.keys(feeds).forEach(cat => allArticles.push(...(feeds[cat] || [])));
      allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      
      const mapped = allArticles.slice(0, 5).map((art, i) => ({
         id: i,
         title: art.title,
         type: art.domain || 'GDELT Intel',
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
    { title: 'Diplomatic Posture', value: data.diplomaticStatus, icon: Globe2, color: 'var(--accent-blue)' },
    { title: 'National Inflation YoY', value: data.inflation, icon: TrendingUp, color: 'var(--text-secondary)' },
    { title: 'Annual Defense Budget', value: data.defenseBudget, icon: ShieldAlert, color: 'var(--text-primary)' },
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>{userCountry ? `${userCountry} Regional Overview` : 'Global Overview'}</h1>
        <p>Real-time localized synthesis of cross-domain intelligence parameters.</p>
      </header>

      <div className="bento-dashboard-grid">
        {summaryCards.map((card, idx) => (
          <motion.div 
            key={idx}
            className="bento-card bento-card-summary"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: idx * 0.1 }}
          >
            <div className="card-header">
              <span className="card-title">{card.title}</span>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div className="card-value" style={{ color: card.color }}>
              {card.value}
            </div>
          </motion.div>
        ))}

        <motion.div 
          className="bento-card bento-card-news"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.3 }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px'}}>
             <Newspaper size={20} style={{color: 'var(--accent-blue)'}} />
             <h3 style={{border: 'none', margin: 0, padding: 0, color: 'var(--text-primary)', fontSize: '1.1rem'}}>Breaking News</h3>
          </div>
          <ul className="alert-list">
            {loadingNews ? (
                <div style={{color: 'var(--text-secondary)', padding: '16px'}}>Tapping Global Matrix...</div>
            ) : liveNews.map((n, i) => (
              <motion.li 
                key={n.id} 
                className="alert-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <a href={n.url} target="_blank" rel="noopener noreferrer" className="news-link">
                     {n.title}
                   </a>
                   <span className="news-type">{n.type}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          className="bento-card bento-card-history"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.4 }}
        >
          <h3 className="bento-header">{userCountry ? `${userCountry} Historical Trajectory` : 'Global Historical Trajectory'}</h3>
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
      </div>
    </div>
  );
}
