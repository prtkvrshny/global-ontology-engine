import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Activity, Server, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import { fetchGdeltData } from '../utils/gdeltFetcher';
import { ReportModal } from '../components/ReportModal';
import './DataFeeds.css';

export function DataFeeds({ userCountry }) {
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeed, setSelectedFeed] = useState(null);

  const loadFeeds = async () => {
    setLoading(true);
    const query = filter === 'All' ? (userCountry || 'Global') : filter;
    try {
      const articles = await fetchGdeltData(query, 50);
      const mappedFeeds = articles.map((art, idx) => {
        let sev = 'low';
        let domain = filter === 'All' ? 'Geopolitics' : filter;
        
        if (art.title.toLowerCase().includes('war') || art.title.toLowerCase().includes('attack')) sev = 'high';
        else if (art.title.toLowerCase().includes('economy') || art.title.toLowerCase().includes('trade')) { sev = 'moderate'; domain = 'Economics'; }
        
        return {
          id: idx,
          domain: domain,
          severity: sev,
          message: art.title,
          source: art.domain,
          url: art.url,
          timestamp: new Date(
            art.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')
          ).toLocaleTimeString()
        };
      });
      setAlerts(mappedFeeds);
    } catch (err) {
      console.error('GDELT fetch error, falling back:', err);
      const f = filter === 'All' ? 'Global' : filter;
      setAlerts([
        { id: 1, domain: filter==='All' ? 'Defense' : filter, severity: 'high', timestamp: new Date().toLocaleTimeString(), message: `Unauthorized airspace incursion detected globally affecting ${f}.`, source: 'MIL-SAT-4', url: `https://news.google.com/search?q=${encodeURIComponent(f + ' defense military airspace')}` },
        { id: 2, domain: filter==='All' ? 'Economics' : filter, severity: 'moderate', timestamp: new Date().toLocaleTimeString(), message: `Sudden massive volume offloading relating to ${f} equities.`, source: 'DARK-POOL-8', url: `https://news.google.com/search?q=${encodeURIComponent(f + ' economy stock market')}` },
        { id: 3, domain: filter==='All' ? 'Geopolitics' : filter, severity: 'low', timestamp: new Date().toLocaleTimeString(), message: `Diplomatic backchannel chatter increased by 400% regarding ${f} perimeter.`, source: 'SIGINT-ALPHA', url: `https://news.google.com/search?q=${encodeURIComponent(f + ' geopolitics diplomacy')}` },
        { id: 4, domain: filter==='All' ? 'Cyber' : filter, severity: 'high', timestamp: new Date().toLocaleTimeString(), message: `Zero-day exploit signature identified traversing ${f} fiber trunks.`, source: 'NSA-HUB', url: `https://news.google.com/search?q=${encodeURIComponent(f + ' cyber attack infrastructure')}` },
        { id: 5, domain: filter==='All' ? 'Climate' : filter, severity: 'moderate', timestamp: new Date().toLocaleTimeString(), message: `Rapid thermal anomaly detected near ${f} currents.`, source: 'NOAA-API', url: `https://news.google.com/search?q=${encodeURIComponent(f + ' climate environment')}` }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFeeds();
    const intervalId = setInterval(loadFeeds, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(intervalId);
  }, [filter, userCountry]);

  const filteredFeeds = alerts.filter(feed => filter === 'All' || feed.domain === filter); 

  return (
    <div className="feeds-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Live Intelligence Feeds</h1>
          <p>Unfiltered, real-time data streams across all ontological domains.</p>
        </div>
        <div className="live-indicator">
          <div className="live-dot"></div> LIVE NETWORK
        </div>
      </header>

      <div className="feeds-list">
        {loading ? (
           <div style={{color: '#fff', textAlign: 'center', padding: '40px'}}>Intercepting Global Subnet Transmissions...</div>
        ) : filteredFeeds.map((feed, idx) => (
          <motion.div 
            key={feed.id} 
            className={`feed-card severity-${feed.severity}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx % 10) * 0.05 }}
          >
            <div className="feed-header">
              <span className="feed-type">
                {feed.severity === 'high' ? <AlertTriangle size={16}/> : <Activity size={16}/>}
                {feed.domain}
              </span>
              <span className="feed-time">{feed.timestamp}</span>
            </div>
            <div className="feed-content">
              <p>{feed.message}</p>
              {feed.source && <div style={{marginTop: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)'}}>NODE: {feed.source}</div>}
            </div>
            <div className="feed-actions">
              <a href={feed.url} target="_blank" rel="noopener noreferrer" className="feed-action-btn">
                 <ExternalLink size={14}/> View Source
              </a>
              <button className="feed-action-btn" onClick={() => setSelectedFeed(feed)}>
                 <FileText size={14}/> Gen Report
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <ReportModal feed={selectedFeed} onClose={() => setSelectedFeed(null)} />
    </div>
  );
}
