import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings2, X, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './VoiceAssistant.css';

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (transcript) {
            handleQuery(transcript);
          }
        };
      }
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleQuery = (query) => {
    // Simulate an AI response based on the query keywords
    const lowerQuery = query.toLowerCase();
    setResponse("Analyzing the global ontology...");
    
    setTimeout(() => {
      if (lowerQuery.includes('geopolitics') || lowerQuery.includes('india')) {
        setResponse("Insight (Geopolitics): India's latest strategic shifts in South Asia indicate a multi-aligned approach, balancing technology pacts with the US while maintaining traditional defense ties. Economic indicators point to a 6.5% GDP growth, buoyed by domestic manufacturing. The ontology shows high correlation between these factors and recent policy changes.");
      } else if (lowerQuery.includes('climate')) {
        setResponse("Insight (Climate): Current data feeds show a 12% increase in extreme weather events globally this quarter. The ontology maps these events to supply chain disruptions in Southeast Asia, impacting tech manufacturing indices.");
      } else {
        setResponse("Insight (General): The engine has parsed your query. Analyzing data nodes across defense, economics, and technology... No high-level anomalies detected in this specific sector. Would you like a deeper graph traversal?");
      }
    }, 1500);
  };

  return (
    <>
      <button 
        className={`voice-fab glass-panel ${isListening ? 'listening' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <span className="pulse-ring"></span>
        <Mic size={24} className="fab-icon" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="voice-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="voice-modal glass-panel"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
            >
              <div className="voice-modal-header">
                <h3>Global Ontology AI</h3>
                <button className="close-btn" onClick={() => { setIsOpen(false); setIsListening(false); recognitionRef.current?.stop(); }}>
                  <X size={20} />
                </button>
              </div>

              <div className="voice-content">
                <div className="status-indicator">
                  <div className={`status-dot ${isListening ? 'active' : ''}`}></div>
                  <span>{isListening ? 'Listening to intel query...' : 'System Ready'}</span>
                </div>

                <div className="transcript-area">
                  <p className="user-query">{transcript || "Ask a question about geopolitics, climate, or economics..."}</p>
                </div>

                {response && (
                  <motion.div 
                    className="response-area"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="response-header">
                      <Settings2 size={16} className="text-cyan" />
                      <h4>Ontology Synthesis</h4>
                    </div>
                    <p className="ai-text">{response}</p>
                  </motion.div>
                )}
              </div>

              <div className="voice-controls">
                <button 
                  className={`mic-btn ${isListening ? 'stop' : 'start'}`}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
