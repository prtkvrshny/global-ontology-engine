import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Activity, BarChart2, Zap, FileText } from 'lucide-react';
import './ReportModal.css';

export function ReportModal({ feed, onClose }) {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [reportReady, setReportReady] = useState(false);

  const loadingSteps = [
    "Establishing LLM Ontology Link...",
    "Extacting Named Entities...",
    "Correlating Historical Precedence...",
    "Executing Predictive Sentiment Vectors..."
  ];

  useEffect(() => {
    if (!feed) return;
    
    // Simulate AI generation process delays
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingSteps.length) {
        setLoadingPhase(step);
      } else {
        clearInterval(interval);
        setReportReady(true);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [feed]);

  if (!feed) return null;

  // Generate deeper generic pseudo-analysis based on feed properties
  const sentimentScore = Math.floor(Math.random() * 40) + (feed.severity === 'high' ? 60 : 20);
  const spreadIndex = Math.floor(Math.random() * 50) + 30;
  const historicMatch = Math.floor(Math.random() * 100);
  const impactRadius = feed.severity === 'high' ? 95 : feed.severity === 'moderate' ? 65 : 35;

  const getBriefingText = () => {
    const s = feed.severity;
    const isCritical = s === 'high';
    const impactColor = isCritical ? 'Critical' : s === 'moderate' ? 'Significant' : 'Marginal';
    const responseRequired = isCritical ? 'IMMEDIATE MITIGATION REQUIRED' : 'CONTINUED SURVEILLANCE ADVISED';

    const domainDetails = {
      'Defense': `Tactical sensors indicate a ${impactColor.toLowerCase()} anomaly in force projection parameters. This vector threatens to destabilize local deterrence thresholds. Analysis of historical proxy engagements suggests a ${historicMatch}% probability of cascading kinetic responses if diplomatic channels fail to de-escalate.`,
      'Economics': `Global equities command pathways are registering anomalous volume surges originating from this vector. Secondary supply-chain disruptions are modeled with a ${spreadIndex}% spread velocity. Central banking policy algorithms recommend hedging against immediate peripheral fiscal contagion.`,
      'Climate': `Thermal variance mapping and geological sensors flag this event as a ${impactColor.toLowerCase()} deviation from the established global mean. The disruption matrix highlights immediate threats to regional energy infrastructure, likely prompting localized population displacement within 72 hours.`,
      'Cyber': `A severe infrastructural telemetry breach signature was isolated along primary dark fiber trunks. The payload mimics known state-sponsored zero-day architecture. The current threat containment perimeter is rated at ${100 - sentimentScore}%, necessitating aggressive digital compartmentalization strategies.`,
      'Geopolitics': `Diplomatic chatter and allied backchannel intercepts suggest a fundamental realignment of strategic parameters. Confidence in traditional treaty frameworks is eroding at a ${spreadIndex}% deviation scale. Counter-intelligence elements warn of covert factional mobilization leading to structural gridlock.`
    };

    const details = domainDetails[feed.domain] || domainDetails['Geopolitics'];

    return (
       <>
         <p style={{marginBottom: '12px'}}><strong>Strategic Assessment Phase {Math.floor(Math.random()*900)+100}-A:</strong> {details}</p>
         <p style={{marginBottom: '12px'}}><strong>Geospatial Correlation:</strong> The epicenter is highly correlated with historical instability patterns mapped over the last 15 years. Machine learning models indicate that neglecting this node triggers a ${impactRadius}% impact radius expansion into contiguous economic and defense jurisdictions.</p>
         <p style={{color: isCritical ? '#ff3b30' : 'var(--accent-cyan)', fontWeight: 'bold'}}>{responseRequired}</p>
       </>
    );
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="report-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="report-modal glass-panel"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
        >
          <div className="report-header">
            <h2><Cpu size={24} /> AI Deep-Ontology Analysis</h2>
            <button className="close-btn" onClick={onClose}><X size={24} /></button>
          </div>

          {!reportReady ? (
            <div className="loading-sequence">
              <div className="spinner"></div>
              <motion.div 
                key={loadingPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ fontSize: '1.1rem', fontWeight: 500 }}
              >
                {loadingSteps[loadingPhase]}
              </motion.div>
            </div>
          ) : (
            <motion.div 
              className="report-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="report-section">
                <h3><Activity size={20} /> Executive Summary</h3>
                <p className="report-text">
                  <strong>Subject Outline:</strong> {feed.message}<br/><br/>
                  <strong>Algorithmic Synthesis:</strong> Machine analysis of the isolated `{feed.domain}` vector indicates a {feed.severity}-severity intelligence anomaly originating from `{feed.source || 'Unknown Origin Node'}`.
                </p>
              </div>

              <div className="report-section">
                <h3><FileText size={20} /> Comprehensive Assessment Briefing</h3>
                <div className="report-text analytical-briefing">
                   {getBriefingText()}
                </div>
              </div>

              <div className="report-section">
                <h3><BarChart2 size={20} /> Analytical Vectors</h3>
                <div className="graph-container">
                  <div className="graph-bar-wrapper">
                    <div className="graph-bar" style={{ height: `${sentimentScore}%` }}>
                      <span className="graph-value">{sentimentScore}%</span>
                    </div>
                    <span className="graph-label">Tension<br/>Score</span>
                  </div>
                  <div className="graph-bar-wrapper">
                    <div className="graph-bar" style={{ height: `${spreadIndex}%`, background: 'linear-gradient(to top, var(--accent-purple), var(--accent-cyan))' }}>
                      <span className="graph-value">{spreadIndex}%</span>
                    </div>
                    <span className="graph-label">Spread<br/>Velocity</span>
                  </div>
                  <div className="graph-bar-wrapper">
                    <div className="graph-bar" style={{ height: `${historicMatch}%`, background: 'linear-gradient(to top, #34c759, var(--accent-cyan))' }}>
                      <span className="graph-value">{historicMatch}%</span>
                    </div>
                    <span className="graph-label">Historic<br/>Precedence</span>
                  </div>
                  <div className="graph-bar-wrapper">
                    <div className="graph-bar" style={{ height: `${impactRadius}%`, background: feed.severity === 'high' ? 'linear-gradient(to top, #ff3b30, #ff9500)' : 'linear-gradient(to top, var(--accent-blue), var(--accent-cyan))' }}>
                      <span className="graph-value">{impactRadius}</span>
                    </div>
                    <span className="graph-label">Impact<br/>Radius</span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3><Zap size={20} /> Strategic Action Matrix</h3>
                <div className="action-matrix">
                  <div className="action-card">
                    <h4>Primary Directive (Phase Alpha)</h4>
                    <p>Elevate threat monitoring protocol in the {feed.domain} sector. Instigate automated geospatial crawler agents to corroborate {feed.source} transmission validity against raw signals intelligence.</p>
                  </div>
                  <div className="action-card">
                    <h4>Secondary Protocol (Phase Beta)</h4>
                    <p>Brief embedded regional operatives and modify localized Intelligence Graph security weights by an escalation factor to reflect the current threat paradigm.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
