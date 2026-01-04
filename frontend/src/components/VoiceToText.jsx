import React, { useRef, useState, useEffect } from 'react';
import '../styles/VoiceToText.css';

const VoiceToText = ({ onText }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setError('Speech Recognition not supported in this browser');
    }
  }, []);

  const handleMicClick = () => {
    if (!supported) {
      setError('Speech Recognition not supported. Try Chrome, Edge, or Safari.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    setError(null);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech Recognition not available');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = (e) => {
        setError(`Error: ${e.error}`);
        setListening(false);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (event.isFinal && onText) {
          onText(transcript + ' ');
        }
      };

      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      setListening(false);
    }
  };

  return (
    <div className="voice-to-text-container">
      <button
        className={`mic-btn${listening ? ' listening' : ''}${!supported ? ' disabled' : ''}`}
        onClick={handleMicClick}
        aria-label={listening ? 'Stop listening' : 'Start listening'}
        disabled={!supported}
        title={supported ? (listening ? 'Stop listening' : 'Start voice input') : 'Speech Recognition not supported'}
      >
        <span className="mic-icon">🎤</span>
        {listening && <span className="listening-animation" />}
      </button>
      {error && <div className="voice-error">{error}</div>}
    </div>
  );
};

export default VoiceToText;
