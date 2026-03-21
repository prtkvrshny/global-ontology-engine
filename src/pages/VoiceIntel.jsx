import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Cpu, User, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchGdeltData } from '../utils/gdeltFetcher';
import './VoiceIntel.css';

export function VoiceIntel({ userCountry }) {
  const [messages, setMessages] = useState([
    { role: 'system', text: `Voice Intel System Initialized. Operator origin: ${userCountry}. How can I assist you with global ontology queries?` }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check support for SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserQuery(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if(event.error === 'not-allowed') {
           setMessages(prev => [...prev, { role: 'system-error', text: 'Microphone access denied. Please allow permissions or use text input.' }]);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!isSupported) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // Handle case where it might already be started
        console.error(err);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if(textInput.trim() !== '') {
       handleUserQuery(textInput);
       setTextInput('');
    }
  };

  const handleUserQuery = (query) => {
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    
    // Simulate AI Processing Delay
    setTimeout(() => {
        generateResponse(query);
    }, 1500);
  };

  const generateResponse = async (query) => {
    const q = query.toLowerCase();
    
    // Check if the user is asking for specific news or an entity
    if (q.includes('news') || q.includes('feed') || q.includes('happening') || q.includes('status')) {
       // Extract keyword (dumb proxy for named entity recognition)
       const cleanedQuery = q.replace(/(what is|tell me about|news|feed|happening in|on|about|the status of)/g, '').trim() || userCountry || 'Global';
       
       try {
          const articles = await fetchGdeltData(cleanedQuery, 3);
          if(articles.length > 0) {
             const headlines = articles.map(a => `"${a.title}"`).join(', and ');
             setMessages(prev => [...prev, { role: 'ai', text: `GDELT feed for ${cleanedQuery}: Recent intel indicates ${headlines}.` }]);
          } else {
             setMessages(prev => [...prev, { role: 'ai', text: `I am currently tracking no pressing anomalies for "${cleanedQuery}" on the GDELT network at this hour.` }]);
          }
       } catch (err) {
          setMessages(prev => [...prev, { role: 'ai', text: `Network protocols denied access to GDELT for "${cleanedQuery}". Operating locally.` }]);
       }
       return;
    }

    let response = "I am processing that query against the global ontology. Current unclassified data is limited on this specific parameter. Please refine your search.";
    
    if (q.includes('geopolitic') || q.includes('world')) {
        response = `Current geopolitical tension is elevated (L3) globally. Key shifts detected in energy grids across Northern Europe and minor supply chain disruptions in the South China Sea.`;
    } else if (q.includes('defense') || q.includes('military')) {
        response = `Defense Intel active: Middle East sector showing elevated unit movements (142 tracked units). Asian sector flagged as critical with dense naval deployments.`;
    } else if (q.includes('climate') || q.includes('environment')) {
        response = `Climate parameter analysis: Global sea levels register a +3.4mm/yr rise. Notable thermal anomalies detected across equatorial currents.`;
    } else if (q.includes('friend') || q.includes('ally') || q.includes('relations')) {
        response = `Generating diplomatic posture report for ${userCountry}. Check the Intelligence Graph to visually track your active bilateral agreements and known threat vectors.`;
    } else if (q.includes('india')) {
        response = `Filtering ontological data for India: Diplomatic posture remains developing, with strong economic pacts recently signed. Threat vectors in bordering regions are being actively monitored.`;
    }

    setMessages(prev => [...prev, { role: 'ai', text: response }]);
  };

  return (
    <div className="voice-intel-container window-layout">
      <header className="page-header">
        <h1>Voice Intel Interface</h1>
        <p>Direct conversational query access to the Global Ontology Engine.</p>
      </header>

      {!isSupported && (
          <div className="support-warning glass-panel">
             <AlertTriangle className="text-red" size={20} />
             <span>Your browser does not support the Web Speech API natively (Try Chrome/Edge). You can still query the system using the text terminal below.</span>
          </div>
      )}

      <div className="chat-window glass-panel">
         <div className="chat-log">
            {messages.map((msg, idx) => (
                <motion.div 
                   key={idx} 
                   className={`chat-bubble ${msg.role}`}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                >
                   <div className="bubble-icon">
                      {msg.role === 'user' ? <User size={16} /> : 
                       msg.role === 'system-error' ? <AlertTriangle size={16} className="text-red"/> : 
                       <Cpu size={16} className="text-cyan" />}
                   </div>
                   <div className="bubble-text">{msg.text}</div>
                </motion.div>
            ))}
            <div ref={messagesEndRef} />
         </div>
         
         <div className="chat-controls">
            <button 
               className={`mic-button ${isListening ? 'listening' : ''} ${!isSupported ? 'disabled' : ''}`}
               onClick={toggleListening}
               disabled={!isSupported}
            >
               {isListening ? (
                  <> <MicOff size={24} /> <span className="pulse-ring"></span> </>
               ) : (
                  <Mic size={24} />
               )}
            </button>
            <form className="text-input-form" onSubmit={handleManualSubmit}>
               <input 
                 type="text" 
                 placeholder={isListening ? "Listening..." : "Type a query or use voice..."} 
                 value={textInput}
                 onChange={(e) => setTextInput(e.target.value)}
                 disabled={isListening}
               />
               <button type="submit" disabled={isListening || !textInput.trim()}>
                  <Send size={18} />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
}
