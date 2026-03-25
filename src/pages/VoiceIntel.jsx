import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Cpu, User, AlertTriangle, Database, Search, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchGdeltData } from '../utils/gdeltFetcher';
import './VoiceIntel.css';

// ─── Gemini API Integration ───
const GEMINI_API_KEY = 'AIzaSyBBzRovoianyVEPCi0KA5uXKQL2chx6qZw';

const callGemini = async (prompt) => {
  const models = ['gemini-2.0-flash-lite', 'gemini-1.5-flash'];
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
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      }
    } catch (e) { continue; }
  }
  return null;
};

// ─── Constants ───
const CATEGORIES = ['Geopolitics', 'Economics', 'Defense', 'Technology', 'Climate', 'Society'];

const scoreArticle = (title) => {
  const t = title.toLowerCase();
  let score = 3;
  if (t.match(/war|invasion|nuclear|collapse|assassination|genocide|pandemic/)) score += 6;
  else if (t.match(/attack|bomb|killed|crisis|emergency|sanctions|blockade|coup/)) score += 5;
  else if (t.match(/threat|conflict|missile|escalat|recession|crash|breach/)) score += 4;
  else if (t.match(/tension|dispute|warning|cyber|hack|protest|flood|earthquake/)) score += 3;
  return Math.min(score, 10);
};

export function VoiceIntel({ userCountry }) {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [kbLoading, setKbLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ─── Initial Feed Ingestion ───
  useEffect(() => {
    const loadKB = async () => {
      setKbLoading(true);
      const country = userCountry || 'Global';
      const categoryQueries = {
        Geopolitics: `${country} geopolitics diplomacy`,
        Economics: `${country} economy GDP trade`,
        Defense: `${country} military defense security`,
        Technology: `${country} technology AI digital`,
        Climate: `${country} climate environment weather`,
        Society: `${country} society education election`,
      };

      try {
        const results = await Promise.allSettled(
          Object.entries(categoryQueries).map(async ([cat, query]) => {
            const articles = await fetchGdeltData(query, 10);
            return articles.map(art => ({
              title: art.title,
              category: cat,
              score: scoreArticle(art.title),
              source: art.domain || 'RSS-CORE',
            }));
          })
        );
        let allItems = [];
        results.forEach(r => r.status === 'fulfilled' && allItems.push(...r.value));
        setKnowledgeBase(allItems);
        setMessages([{
          role: 'system',
          text: `🧠 **Personal Agent Active.** Knowledge base initialized with **${allItems.length} news vectors** for **${country}**. I am now 100% self-intelligent. You can ask me about these articles, or I can perform a Deep-Search on any other topic.`
        }]);
      } catch (err) {
        console.error(err);
      }
      setKbLoading(false);
    };
    loadKB();
  }, [userCountry]);

  // ─── Chat Logic ───
  const handleUserQuery = async (query) => {
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsThinking(true);

    const country = userCountry || 'Global';
    const q = query.toLowerCase();

    // 1. Identify intent and perform Deep Search if needed
    let contextData = [];
    let isDeepQuery = false;

    // Check if query deviates from local KB categories
    const relevantToKB = CATEGORIES.some(cat => q.includes(cat.toLowerCase()));
    const isGeneralBriefing = q.match(/what.*(happening|status|overview|summary|update)/);

    if (!relevantToKB && !isGeneralBriefing) {
      isDeepQuery = true;
      setIsDeepSearching(true);
      try {
        // Perform targeted search for the "deviated" query
        const searchTerms = q.replace(/what|about|tell|me|is|the|news|latest|any|on|for|in|of/g, '').trim();
        const freshNews = await fetchGdeltData(searchTerms || country, 5);
        contextData = freshNews.map(n => `[Deep-Search Match] ${n.title}`);
      } catch (e) {
        console.warn('Deep Search failed:', e);
      }
      setIsDeepSearching(false);
    }

    // Combine with local KB context
    const localMatches = knowledgeBase.filter(a => {
        const title = a.title.toLowerCase();
        return q.split(' ').some(word => word.length > 3 && title.includes(word));
    }).slice(0, 5).map(a => `[Local KB - ${a.category}] ${a.title}`);

    const finalContext = [...contextData, ...localMatches].join('\n');

    // 2. Synthesize with Gemini AI
    const apiPrompt = `You are a world-class geopolitical analyst and personal intelligence assistant for an operator in ${country.toUpperCase()}. 
You have access to a knowledge base of recent news articles.

CONTEXT DATA FROM FEEDS:
${finalContext || 'No specific news articles found for this exact query. Use your internal training data but mention you are searching beyond current feeds.'}

USER QUERY: "${query}"

INSTRUCTIONS:
- If context was found, analyze it and provide a structured, insightful answer.
- If no news context was found, provide a smart, "self-intelligent" answer based on your general knowledge, but tailor it as an intelligence briefing for ${country}.
- Keep it concise, professional, and predictive (what might happen next?).
- Use markdown bolding for key points.
- If you performed a "Deep Search" (finding info beyond local KB), mention that your intelligence agents tracked new signals.

RESPONSE FORMAT:
One insightful 4-6 sentence briefing.`;

    try {
      const gResponse = await callGemini(apiPrompt);
      if (gResponse) {
        setMessages(prev => [...prev, { 
            role: 'ai', 
            text: gResponse,
            source: isDeepQuery ? 'Deep Intelligence Search' : 'Live Knowledge Base'
        }]);
        speak(gResponse);
      } else {
        throw new Error('Fallback to local');
      }
    } catch (err) {
      // Fallback response if AI fails
      setMessages(prev => [...prev, { role: 'ai', text: "Signal degradation detected. I'm processing your request using local ontology kernels. Please standby for re-link." }]);
    }

    setIsThinking(false);
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const cleanText = text.replace(/[*#]/g, '').split('\n')[0].substring(0, 250);
    const audio = new SpeechSynthesisUtterance(cleanText);
    audio.rate = 1.05;
    audio.pitch = 0.85;
    window.speechSynthesis.speak(audio);
  };

  // ─── Speech ───
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (e) => handleUserQuery(e.results[0][0].transcript);
      recognitionRef.current.onend = () => setIsListening(false);
    } else { setIsSupported(false); }
  }, []);

  const toggleListening = () => {
    if (!isSupported) return;
    if (isListening) recognitionRef.current.stop();
    else { try { recognitionRef.current.start(); setIsListening(true); } catch(e){} }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="voice-intel-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Search Command Intelligence</h1>
          <p>Self-intelligent agent powered by Gemini AI and Deep GDELT retrieval.</p>
        </div>
        <div className="kb-status">
          <Database size={14} />
          {kbLoading ? 'Syncing...' : `${knowledgeBase.length} News Vectors`}
        </div>
      </header>

      <div className="chat-window bento-card">
        <div className="chat-log">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} className={`chat-bubble ${msg.role}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bubble-icon">
                  {msg.role === 'user' ? <User size={16} /> : <Cpu size={16} className="text-cyan" />}
                </div>
                <div className="bubble-content">
                  {msg.source && <span className="source-tag"><Zap size={10} /> {msg.source}</span>}
                  <div className="bubble-text">
                    {msg.text.split('\n').map((l, j) => (
                      <p key={j} style={{ margin: '4px 0' }} dangerouslySetInnerHTML={{ __html: l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isThinking && (
            <div className="chat-bubble ai thinking">
              <div className="bubble-icon"><Cpu size={16} className="text-cyan" /></div>
              <div className="thinking-box">
                {isDeepSearching ? <span><Globe size={14} className="spin" /> Deep Searching GDELT...</span> : <span><Zap size={14} /> AI Reasoning...</span>}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-controls">
          <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={toggleListening}>
            {isListening ? <><MicOff size={22} /><span className="pulse-ring" /></> : <Mic size={22} />}
          </button>
          <form className="text-input-form" onSubmit={(e) => { e.preventDefault(); if(textInput.trim()){ handleUserQuery(textInput); setTextInput(''); }}}>
            <input placeholder={isListening ? 'Listening...' : 'Search news or ask AI...'} value={textInput} onChange={(e) => setTextInput(e.target.value)} disabled={isListening} />
            <button type="submit" disabled={isThinking || !textInput.trim()}><Send size={18} /></button>
          </form>
        </div>
      </div>

      <div className="quick-actions">
        {["Search latest military news", "Summarize economy", "Biggest threat?", "What's happening in ${userCountry}?"].map(q => (
          <button key={q} className="quick-chip" onClick={() => handleUserQuery(q.replace('${userCountry}', userCountry))}>{q.replace('${userCountry}', userCountry)}</button>
        ))}
      </div>
    </div>
  );
}
