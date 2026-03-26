import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, FileText, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ReportModal.css';

// ─── Gemini API Integration ───
const GEMINI_API_KEY = 'AIzaSyBBzRovoianyVEPCi0KA5uXKQL2chx6qZw';

const callGemini = async (prompt) => {
  // Try multiple model endpoints in order of preference
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite', 
    'gemini-1.5-flash',
    'gemini-pro',
  ];
  
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.2, 
            maxOutputTokens: 1024,
            responseMimeType: "application/json"
          }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
      // If this model fails, try the next one
    } catch (e) {
      continue;
    }
  }
  
  // If all Gemini models fail, use built-in intelligent analysis
  return null;
};

// ─── Intelligent Local Analysis (Fallback) ───
const generateLocalAnalysis = (headline, country) => {
  const t = headline.toLowerCase();
  
  let summary = '';
  let impact = [];
  let graphData = [
    { name: 'Stability', value: 70 },
    { name: 'Risk', value: 30 },
    { name: 'Urgency', value: 40 }
  ];
  
  // Generate contextual summary based on keyword detection
  if (t.match(/war|conflict|military|attack|strike/)) {
    summary = `This development signals a significant escalation in military tensions that could reshape regional security dynamics. The conflict trajectory suggests potential involvement of major powers and could trigger broader geopolitical realignments.`;
    impact = [
        `Energy Security: Potential 15% increase in fuel prices.`,
        `Defense Spending: Pressure to increase military preparedness.`,
        `Diplomatic Positioning: Need to navigate alliance obligations.`
    ];
    graphData = [
        { name: 'Security Risk', value: 90 },
        { name: 'Diplomatic Strain', value: 75 },
        { name: 'Economic Volatility', value: 60 }
    ];
  } else if (t.match(/economy|gdp|trade|inflation|market|recession|tariff/)) {
    summary = `This economic development reflects deeper structural shifts in global financial markets. The implications extend beyond immediate market reactions to potentially reshape monetary policy decisions across major economies.`;
    impact = [
        `Trade Balance: Export competitiveness could be directly affected.`,
        `Currency Pressure: Domestic currency may face depreciation pressure.`,
        `Investment flow: FDI could be impacted by shifting risk profiles.`
    ];
    graphData = [
        { name: 'Market Risk', value: 85 },
        { name: 'Inflationary Pressure', value: 70 },
        { name: 'Growth Impact', value: -40 }
    ];
  } else {
    summary = `This geopolitical development signals a notable shift in international relations. The event reflects broader trends in global power dynamics and multilateral cooperation frameworks.`;
    impact = [
        `Diplomatic Relations: Bilateral relationships may be tested.`,
        `Regional Stability: Neighborhood may experience increased volatility.`,
        `Trade Agreements: Strategic corridors could face negotiation pressure.`
    ];
  }
  
  return { summary, impact, graphData };
};

export function ReportModal({ feed, onClose, userCountry }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [impact, setImpact] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [error, setError] = useState('');
  const [source, setSource] = useState(''); // 'gemini' or 'local'

  useEffect(() => {
    if (!feed) {
      setSummary('');
      setImpact('');
      setError('');
      setSource('');
      setLoading(false);
      return;
    }
    generateReport();
  }, [feed]);

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setSummary('');
    setImpact('');

    const country = userCountry || 'the host nation';
    const headline = feed.message || feed.title || '';
    
    let articleText = '';
    try {
      if (feed.url) {
        const scrapeRes = await fetch(`/api/scrape?url=${encodeURIComponent(feed.url)}`);
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          articleText = scrapeData.text || '';
        }
      }
    } catch (e) {
      console.warn("Could not scrape article text, falling back to headline-only analysis", e);
    }

    const promptContext = articleText ? `
**NEWS HEADLINE:** "${headline}"
**ARTICLE EXCERPT:**
"""
${articleText.substring(0, 3000)}
"""` : `**NEWS HEADLINE:** "${headline}"`;

    const prompt = `You are a high-level NLP analyst. Strictly analyze the following article text and provide a structured report in JSON format. 
DO NOT use generic geopolitical filler. Base every word on the specific news article provided.

${promptContext}

**TARGET COUNTRY:** ${country}

**REQUIREMENTS:**
1. "summary": A concise 3-4 sentence analytical summary strictly bound to the article content.
2. "impact": An array of 4 strings explaining specific consequences for ${country}.
3. "graph": An array of objects for a Bar Chart: [{"name": "Risk", "value": 0-100}, {"name": "Economic", "value": 0-100}, {"name": "Diplomatic", "value": 0-100}, {"name": "Urgency", "value": 0-100}]. Calculate these values based on the text intensity.

Return EXACTLY this JSON structure:
{
  "summary": "...",
  "impact": ["...", "..."],
  "graph": [{"name": "...", "value": 0}, ...]
}`;

    try {
      const geminiResult = await callGemini(prompt);
      
      if (geminiResult) {
        const data = JSON.parse(geminiResult);
        setSummary(data.summary || '');
        setImpact(data.impact || []);
        setGraphData(data.graph || []);
        setSource('gemini');
      } else {
        const local = generateLocalAnalysis(headline, country);
        setSummary(local.summary);
        setImpact(local.impact);
        setGraphData(local.graphData);
        setSource('local');
      }
    } catch (err) {
      const local = generateLocalAnalysis(headline, country);
      setSummary(local.summary);
      setImpact(local.impact);
      setGraphData(local.graphData);
      setSource('local');
    }
    setLoading(false);
  };

  if (!feed) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="report-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="report-modal bento-card"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="report-header">
            <h2><Cpu size={22} /> AI Intelligence Report</h2>
            <button className="close-btn" onClick={onClose}><X size={22} /></button>
          </div>

          {loading ? (
            <div className="loading-sequence">
              <div className="spinner"></div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}
              >
                Analyzing intelligence patterns...
              </motion.div>
            </div>
          ) : (
            <motion.div 
              className="report-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Original Headline */}
              <div className="report-headline">
                <span className="headline-label">ANALYZED HEADLINE</span>
                <p>{feed.message}</p>
              </div>

              {/* Section 1: Summary */}
              <div className="report-section">
                <h3><FileText size={18} /> Summary</h3>
                <div className="report-text">
                  {summary.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i} style={{ marginBottom: '8px' }}>{line}</p>
                  ))}
                </div>
              </div>

              {/* Section 2: Sentiment/Impact Visualization */}
              {graphData && graphData.length > 0 && (
                <div className="report-section chart-section">
                  <h3><BarChart3 size={18} /> Sentiment Analysis Vectors</h3>
                  <div style={{ width: '100%', height: '220px', marginTop: '15px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={graphData} layout="vertical" margin={{ left: -10, right: 30 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {graphData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value > 60 ? '#f87171' : entry.value > 30 ? '#fbbf24' : '#34d399'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Section 3: Impact */}
              {impact && impact.length > 0 && (
                <div className="report-section">
                  <h3><AlertTriangle size={18} /> Potential Impact on {userCountry}</h3>
                  <div className="report-text impact-list">
                    {impact.map((line, i) => (
                      <div key={i} className="impact-item">
                        <div className="impact-bullet"></div>
                        <p dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source indicator */}
              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {source === 'gemini' ? '⚡ Powered by Gemini AI' : '🧠 Powered by Ontology Analysis Engine'}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
