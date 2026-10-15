import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSound } from '../hooks/useSound';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const MobileVoiceAssistant = () => {
  const [status, setStatus] = useState('IDLE'); // IDLE, LISTENING, PROCESSING, SPEAKING, ERROR
  const [emotion, setEmotion] = useState('neutral');
  const [chatLog, setChatLog] = useState([
    "[SYSTEM]: LUMA.EXE initialized.",
    "[SYSTEM]: Neural Net Interface connected.",
    "[LUMA]: Online and ready. Speak or type a command."
  ]);
  const [inputText, setInputText] = useState('');

  const { playSound } = useSound();
  const logEndRef = useRef(null);

  // Safe refs for lifecycle and browser speech APIs
  const recognitionRef = useRef(null);
  const isMounted = useRef(true);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  // Initialize SpeechRecognition and clean up on unmount
  useEffect(() => {
    isMounted.current = true;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }

    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const appendLog = useCallback((sender, msg) => {
    setChatLog(prev => [...prev, `[${sender}]: ${msg}`]);
  }, []);

  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      setStatus('IDLE');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.pitch = 1.1;
    utterance.rate = 1.0;

    utterance.onend = () => {
      if (!isMounted.current) return;
      setStatus('IDLE');
      setEmotion('neutral');
    };

    utterance.onerror = (e) => {
      if (!isMounted.current) return;
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        setStatus('IDLE');
        setEmotion('neutral');
      }
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const sendToAI = useCallback(async (text) => {
    if (!isMounted.current) return;
    setStatus('PROCESSING');
    setEmotion('thinking');

    try {
      const response = await fetch(`${API_BASE_URL}/voice-assistant/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!isMounted.current) return;

      const reply =
        data.response ||
        data.message ||
        data.answer ||
        data.reply ||
        "I received your request, but the response was empty.";

      setStatus('SPEAKING');
      setEmotion(data.emotion || 'happy');
      appendLog('LUMA', reply);
      playSound('ai-response');
      speakText(reply);
    } catch (error) {
      if (!isMounted.current) return;
      setStatus('ERROR');
      setEmotion('sad');
      playSound('error');
      appendLog('SYSTEM', `Connection to AI Server failed: ${error.message}`);
    }
  }, [appendLog, playSound, speakText]);

  const handleListen = () => {
    if (!recognitionRef.current) {
      playSound('error');
      appendLog('SYSTEM', 'Speech recognition not supported in this browser.');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    playSound('button');
    setStatus('LISTENING');

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Recognition start failed/already active:", e);
    }

    recognitionRef.current.onresult = (event) => {
      if (!isMounted.current) return;
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      appendLog('USER', text);
      sendToAI(text);
    };

    recognitionRef.current.onspeechend = () => {
      if (!isMounted.current) return;
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      setStatus(prev => (prev === 'LISTENING' ? 'PROCESSING' : prev));
    };

    recognitionRef.current.onerror = (event) => {
      if (!isMounted.current) return;
      if (event.error === 'aborted') return;

      setStatus('ERROR');
      playSound('error');
      appendLog('SYSTEM', `Microphone error: ${event.error}`);
    };
  };

  const handleStopAudio = () => {
    playSound('click');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
    setStatus('IDLE');
    setEmotion('neutral');
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || status === 'PROCESSING') return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    playSound('typing');
    const query = inputText.trim();
    appendLog('USER', query);
    setInputText('');
    sendToAI(query);
  };

  // ASCII Faces for Retro Emotions
  const getFace = () => {
    if (status === 'LISTENING') return '(O_O)';
    if (status === 'PROCESSING') return '(-_-)zZ';
    if (status === 'ERROR') return '(x_x)';
    if (emotion === 'happy') return '(^u^)';
    if (emotion === 'sad') return '(._.)';
    if (emotion === 'thinking') return '(?_?)';
    return '(o_o)';
  };

  return (
    <section
      className="flex flex-col flex-1 min-h-0 w-full h-full bg-os-gray p-1.5 font-sans select-none overflow-hidden"
      aria-label="LUMA AI Assistant"
    >
      <h1 className="sr-only">LUMA.EXE Artificial Intelligence Voice Assistant</h1>

      {/* Top Avatar + Status Bar */}
      <div className="flex gap-2 mb-1.5 h-24 shrink-0">
        {/* Visualizer / Avatar */}
        <div className="w-24 h-24 bg-black border-2 border-os-dark-gray shadow-retro-inset flex flex-col items-center justify-center text-green-500 font-pixel text-2xl shrink-0">
          <div className={status === 'SPEAKING' ? 'animate-pulse text-yellow-400' : ''}>
            {getFace()}
          </div>
          <div className="text-[9px] mt-2 text-green-700 font-mono uppercase tracking-widest text-center leading-tight">
            LUMA.EXE<br />v1.0
          </div>
        </div>

        {/* System Status & Voice Controls */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="bg-os-white border border-os-dark-gray shadow-retro-inset px-2 py-1 flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
            <div className="text-[9px] font-bold text-os-dark-gray uppercase truncate">
              System Status
            </div>
            <div
              className={`text-xs sm:text-sm font-mono uppercase font-bold truncate ${
                status === 'ERROR'
                  ? 'text-red-600'
                  : status === 'LISTENING'
                  ? 'text-red-500 animate-pulse'
                  : 'text-[#000080]'
              }`}
            >
              {status}
            </div>
          </div>

          <div className="flex gap-1.5 h-9 shrink-0">
            <button
              type="button"
              className={`retro-btn flex-1 px-2 font-bold text-xs flex items-center justify-center gap-1.5 truncate ${
                status === 'LISTENING' ? 'shadow-retro-inset bg-[#d0d0d0]' : ''
              }`}
              onClick={handleListen}
              disabled={status === 'LISTENING' || status === 'PROCESSING' || status === 'SPEAKING'}
            >
              <span
                className={`text-sm leading-none ${
                  status === 'LISTENING' ? 'text-red-600 animate-ping' : 'text-red-600'
                }`}
              >
                ●
              </span>
              <span>{status === 'LISTENING' ? 'Listening...' : 'Start Mic'}</span>
            </button>

            <button
              type="button"
              className="retro-btn px-3 font-bold text-xs flex items-center justify-center gap-1 shrink-0"
              onClick={handleStopAudio}
            >
              <span className="text-black text-sm leading-none">■</span>
              <span>Stop</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Log (Strict internal scrolling) */}
      <div
        className="flex-1 min-h-0 bg-black border border-os-dark-gray shadow-retro-inset p-2 overflow-y-auto custom-scrollbar font-mono text-xs text-green-500 mb-1.5 leading-relaxed"
        aria-live="polite"
      >
        {chatLog.map((log, i) => (
          <div
            key={i}
            className={`mb-1.5 break-words whitespace-pre-wrap ${
              log.startsWith('[USER]') ? 'text-yellow-400' : ''
            } ${log.startsWith('[SYSTEM]') ? 'text-red-500 font-bold' : ''} ${
              log.startsWith('[LUMA]') ? 'text-[#00ff00]' : ''
            }`}
          >
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Text Input Form */}
      <form
        onSubmit={handleTextSubmit}
        className="flex gap-1.5 h-9 shrink-0 bg-os-gray"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type command..."
          className="flex-1 min-w-0 bg-white border border-os-dark-gray shadow-retro-inset px-2 py-1 text-xs font-sans text-black outline-none focus:bg-blue-50"
          disabled={status === 'PROCESSING'}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="submit"
          className="retro-btn px-4 font-bold text-xs text-black shrink-0"
          disabled={status === 'PROCESSING'}
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default MobileVoiceAssistant;