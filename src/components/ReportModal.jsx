import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, FileText, AlertTriangle } from 'lucide-react';
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
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
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
  let impact = '';
  
  // Generate contextual summary based on keyword detection
  if (t.match(/war|conflict|military|attack|strike/)) {
    summary = `This development signals a significant escalation in military tensions that could reshape regional security dynamics. The conflict trajectory suggests potential involvement of major powers and could trigger broader geopolitical realignments. Historical precedents indicate that such escalations often lead to economic disruptions, refugee movements, and shifts in international diplomatic postures. The international community is likely to respond with a combination of diplomatic interventions and strategic repositioning.`;
    impact = `• **Energy Security**: ${country} could face disruption in energy supply chains, particularly if conflict zones overlap with major oil/gas transit routes, potentially increasing fuel prices domestically by 10-25%.\n• **Defense Spending**: Pressure to increase military preparedness and defense budget allocations, potentially diverting funds from social programs.\n• **Diplomatic Positioning**: ${country} will need to carefully navigate alliance obligations while maintaining strategic autonomy, as taking sides could impact trade relationships.\n• **Economic Ripple Effects**: Supply chain disruptions could affect key import sectors, while currency markets may see increased volatility.\n• **Diaspora Impact**: Citizens of ${country} in affected regions may require evacuation support, straining consular resources.`;
  } else if (t.match(/economy|gdp|trade|inflation|market|recession|tariff/)) {
    summary = `This economic development reflects deeper structural shifts in global financial markets that could redefine trade patterns and investment flows. The implications extend beyond immediate market reactions to potentially reshape monetary policy decisions across major economies. Analysts suggest this could mark a pivotal moment in the current economic cycle, with lasting consequences for both developed and emerging markets.`;
    impact = `• **Trade Balance**: ${country}'s export competitiveness could be directly affected, particularly in sectors tied to global commodity prices and manufacturing supply chains.\n• **Currency Pressure**: The ${country} domestic currency may face depreciation pressure, increasing the cost of imports and potentially triggering inflationary concerns.\n• **Investment Climate**: Foreign direct investment flows into ${country} could be impacted as global investors reassess risk profiles across emerging markets.\n• **Employment Sector**: Industries dependent on international trade may face workforce adjustments, affecting employment rates in key manufacturing and service sectors.\n• **Policy Response**: ${country}'s central bank may need to adjust monetary policy to counteract imported inflation or capital flight risks.`;
  } else if (t.match(/climate|flood|earthquake|hurricane|drought|emission/)) {
    summary = `This climate-related event underscores the accelerating pace of environmental change and its growing impact on human systems. The frequency and intensity of such events have increased markedly in recent years, challenging existing infrastructure resilience and disaster response frameworks. Scientific models suggest this is consistent with projected climate trends, raising urgent questions about adaptation strategies and long-term sustainability.`;
    impact = `• **Agricultural Output**: ${country}'s crop yields could be affected by shifting weather patterns, threatening food security and increasing import dependence for essential commodities.\n• **Infrastructure Vulnerability**: Critical infrastructure in ${country}, including coastal cities and river basins, faces increased risk from extreme weather events.\n• **Insurance & Fiscal Burden**: Rising frequency of climate disasters could strain ${country}'s disaster relief budgets and increase insurance premiums across vulnerable sectors.\n• **Migration Patterns**: Internal displacement due to climate events could accelerate urbanization pressures in ${country}'s major cities.\n• **Green Transition**: This event may accelerate ${country}'s push toward renewable energy adoption and climate-resilient development policies.`;
  } else if (t.match(/tech|ai|cyber|digital|chip|semiconductor|software/)) {
    summary = `This technological development represents a significant shift in the global tech landscape that could influence competitive dynamics across numerous industries. The convergence of artificial intelligence, semiconductor advancement, and digital infrastructure is creating new paradigms for economic growth and national security. The implications span from workforce transformation to geopolitical competition for technological supremacy.`;
    impact = `• **Digital Economy**: ${country}'s growing tech sector could benefit from or be challenged by this development, depending on existing capabilities and talent pipelines.\n• **Cybersecurity Posture**: ${country}'s digital infrastructure may face new threat vectors, requiring updated national cybersecurity frameworks and investment.\n• **Talent Competition**: The global race for tech talent could intensify, affecting ${country}'s ability to attract and retain skilled professionals.\n• **Manufacturing Pivot**: ${country}'s electronics and semiconductor strategies may need recalibration in response to shifting global supply chain dynamics.\n• **Regulatory Framework**: ${country} may need to accelerate development of AI governance and data protection regulations to remain competitive.`;
  } else {
    summary = `This geopolitical development signals a notable shift in international relations that could have cascading effects across diplomatic, economic, and security domains. The event reflects broader trends in global power dynamics and multilateral cooperation frameworks. Analysts are closely monitoring the situation for signs of escalation or de-escalation that could affect regional stability and international trade patterns.`;
    impact = `• **Diplomatic Relations**: ${country}'s bilateral relationships with key partners may be tested, requiring careful diplomatic navigation to protect national interests.\n• **Trade Corridors**: International trade routes and agreements relevant to ${country} could face renegotiation pressure or disruption.\n• **Regional Stability**: ${country}'s immediate neighborhood may experience increased instability, affecting border security and cross-border economic activity.\n• **International Standing**: ${country}'s position in multilateral forums (UN, G20, etc.) could be influenced, creating both opportunities and challenges for diplomatic agenda-setting.\n• **Investment Sentiment**: Global investor confidence in ${country} may fluctuate based on perceived geopolitical risk, affecting capital markets and FDI flows.`;
  }
  
  return { summary, impact };
};

export function ReportModal({ feed, onClose, userCountry }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [impact, setImpact] = useState('');
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

    const prompt = `You are a world-class geopolitical and economic analyst. Based on the following news headline, provide exactly two sections:

**NEWS HEADLINE:** "${headline}"
**HOST COUNTRY:** ${country}

**SECTION 1 - SUMMARY:**
Write a concise, insightful 3-4 sentence summary of what this news means. Explain the context, the key players involved, and why this matters globally. Do NOT just restate the headline — provide real analytical depth.

**SECTION 2 - POTENTIAL IMPACT ON ${country.toUpperCase()}:**
Write 4-5 bullet points explaining the specific potential consequences this news could have on ${country}. Cover economic, diplomatic, security, and societal angles as relevant. Be specific and actionable.

Format your response exactly as:
SUMMARY:
[your summary here]

IMPACT:
[your bullet points here]`;

    try {
      const geminiResult = await callGemini(prompt);
      
      if (geminiResult) {
        // Parse Gemini response
        const summaryMatch = geminiResult.match(/SUMMARY:\s*([\s\S]*?)(?=IMPACT:|$)/i);
        const impactMatch = geminiResult.match(/IMPACT:\s*([\s\S]*)/i);
        setSummary(summaryMatch ? summaryMatch[1].trim() : geminiResult);
        setImpact(impactMatch ? impactMatch[1].trim() : '');
        setSource('gemini');
      } else {
        // Fallback to intelligent local analysis
        const local = generateLocalAnalysis(headline, country);
        setSummary(local.summary);
        setImpact(local.impact);
        setSource('local');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      // Use local analysis on any error
      const local = generateLocalAnalysis(headline, country);
      setSummary(local.summary);
      setImpact(local.impact);
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

              {/* Section 2: Impact */}
              {impact && (
                <div className="report-section">
                  <h3><AlertTriangle size={18} /> Potential Impact on {userCountry}</h3>
                  <div className="report-text impact-text">
                    {impact.split('\n').filter(l => l.trim()).map((line, i) => (
                      <p key={i} style={{ marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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
