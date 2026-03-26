import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, FileText, ExternalLink, AlertTriangle, Globe2, TrendingUp, Shield, Cpu, CloudRain, Users, RefreshCw } from 'lucide-react';
import { fetchAllCategoryFeeds, getRelativeTime } from '../utils/gdeltFetcher';
import { ReportModal } from '../components/ReportModal';
import './DataFeeds.css';

const CATEGORIES = [
  { id: 'All', label: 'All Feeds', icon: Activity },
  { id: 'Geopolitics', label: 'Geopolitics', icon: Globe2 },
  { id: 'Economics', label: 'Economics', icon: TrendingUp },
  { id: 'Defense', label: 'Defense', icon: Shield },
  { id: 'Technology', label: 'Technology', icon: Cpu },
  { id: 'Climate', label: 'Climate', icon: CloudRain },
  { id: 'Society', label: 'Society', icon: Users },
];

// Keyword-based auto-classifier
const classifyArticle = (title) => {
  const t = title.toLowerCase();
  
  if (t.match(/military|army|navy|air force|missile|weapon|defense|defence|war|strike|troops|nato|pentagon|drone/))
    return 'Defense';
  if (t.match(/economy|gdp|trade|inflation|market|stock|bank|currency|tariff|export|import|recession|fiscal|budget/))
    return 'Economics';
  if (t.match(/climate|weather|flood|earthquake|hurricane|carbon|emission|temperature|wildfire|drought|ocean|pollution/))
    return 'Climate';
  if (t.match(/ai|tech|software|chip|cyber|hack|robot|space|satellite|quantum|startup|digital|internet|5g|semiconductor/))
    return 'Technology';
  if (t.match(/election|protest|refugee|rights|health|education|crime|social|community|population|culture|poverty|housing/))
    return 'Society';
  
  return 'Geopolitics'; // Default bucket
};

const getSeverity = (title) => {
  const t = title.toLowerCase();
  if (t.match(/war|attack|crisis|emergency|killed|bomb|threat|collapse/)) return 'high';
  if (t.match(/concern|tension|risk|dispute|sanction|decline|warning/)) return 'moderate';
  return 'low';
};

export function DataFeeds({ userCountry }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [, setTick] = useState(0); // force re-render for relative times

  const loadFeeds = async () => {
    setLoading(true);
    const country = userCountry || 'Global';
    
    try {
      // Use the new fetchAllCategoryFeeds which fetches 10 per category via Vite proxy
      const categoryFeeds = await fetchAllCategoryFeeds(country, 10);
      
      let allItems = [];
      let idCounter = 0;
      
      Object.entries(categoryFeeds).forEach(([category, articles]) => {
        if (articles && articles.length > 0) {
          articles.forEach(art => {
            allItems.push({
              id: idCounter++,
              domain: category,
              severity: getSeverity(art.title),
              message: art.title,
              source: art.domain || 'GDELT',
              url: art.url,
              rawDate: art.pubDate,
            });
          });
        }
      });
      
      if (allItems.length === 0) throw new Error('No articles fetched');
      setAllArticles(allItems);
    } catch (err) {
      console.error('Feed pipeline error:', err);
      const now = new Date().toISOString();
      setAllArticles([
        { id: 1, domain: 'Defense', severity: 'high', rawDate: now, message: `${country} defense posture under active surveillance.`, source: 'FALLBACK', url: `https://news.google.com/search?q=${encodeURIComponent(country + ' defense')}` },
        { id: 2, domain: 'Economics', severity: 'moderate', rawDate: now, message: `${country} GDP growth projections revised by IMF.`, source: 'FALLBACK', url: `https://news.google.com/search?q=${encodeURIComponent(country + ' economy')}` },
        { id: 3, domain: 'Technology', severity: 'low', rawDate: now, message: `${country} digital infrastructure expansion accelerating.`, source: 'FALLBACK', url: `https://news.google.com/search?q=${encodeURIComponent(country + ' technology')}` },
        { id: 4, domain: 'Geopolitics', severity: 'moderate', rawDate: now, message: `${country} diplomatic channels reporting elevated activity.`, source: 'FALLBACK', url: `https://news.google.com/search?q=${encodeURIComponent(country + ' geopolitics')}` },
        { id: 5, domain: 'Climate', severity: 'low', rawDate: now, message: `${country} environmental monitoring stations active.`, source: 'FALLBACK', url: `https://news.google.com/search?q=${encodeURIComponent(country + ' climate')}` },
        { id: 6, domain: 'Society', severity: 'low', rawDate: now, message: `${country} social development indicators under review.`, source: 'FALLBACK', url: `https://news.google.com/search?q=${encodeURIComponent(country + ' society')}` },
      ]);
    }
    setLoading(false);
    setRefreshing(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    loadFeeds();
    const intervalId = setInterval(loadFeeds, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(intervalId);
  }, [userCountry]);

  // Tick every 30s to keep relative times fresh
  useEffect(() => {
    const tickId = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(tickId);
  }, []);

  const handleManualRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeeds();
  }, [userCountry]);

  // Client-side filtering
  const filteredFeeds = useMemo(() => {
    if (activeCategory === 'All') return allArticles;
    return allArticles.filter(a => a.domain === activeCategory);
  }, [activeCategory, allArticles]);

  // Count per category for badges
  const categoryCounts = useMemo(() => {
    const counts = { All: allArticles.length };
    CATEGORIES.forEach(c => {
      if (c.id !== 'All') counts[c.id] = allArticles.filter(a => a.domain === c.id).length;
    });
    return counts;
  }, [allArticles]);

  return (
    <div className="feeds-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{userCountry} Intelligence Feeds</h1>
          <p>Real-time classified streams for {userCountry} across all ontological domains.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="refresh-btn" 
            onClick={handleManualRefresh} 
            disabled={refreshing || loading}
            title="Refresh feeds now"
          >
            <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="live-indicator">
            <div className="live-dot"></div> LIVE NETWORK
          </div>
        </div>
      </header>

      {/* Category Filter Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
              {count > 0 && <span className="tab-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeCategory}
          className="feeds-list"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <div style={{color: 'var(--text-primary)', textAlign: 'center', padding: '40px'}}>Intercepting {userCountry} Subnet Transmissions...</div>
          ) : filteredFeeds.length === 0 ? (
            <div style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '40px'}}>No intelligence detected in this category.</div>
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
                <span className="feed-time" title={feed.rawDate ? new Date(feed.rawDate).toLocaleString() : ''}>{feed.rawDate ? getRelativeTime(feed.rawDate) : 'N/A'}</span>
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
        </motion.div>
      </AnimatePresence>

      <ReportModal feed={selectedFeed} onClose={() => setSelectedFeed(null)} userCountry={userCountry} />
    </div>
  );
}
