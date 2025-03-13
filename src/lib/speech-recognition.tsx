"use client";

import { useState, useEffect, useCallback } from 'react';

// Define the SpeechRecognition interface
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: (event: any) => void;
}

// Check if browser supports SpeechRecognition
const browserSupportsSpeechRecognition = () => {
  return !!(
    typeof window !== 'undefined' &&
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition
  );
};

// Create SpeechRecognition instance
const createRecognitionInstance = (): SpeechRecognitionInterface | null => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognitionAPI = 
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;
  
  if (!SpeechRecognitionAPI) return null;
  
  return new SpeechRecognitionAPI();
};

// Custom hook for speech recognition
export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  // Initialize on client side only
  useEffect(() => {
    // Check if browser supports speech recognition
    setIsSupported(browserSupportsSpeechRecognition());
    
    // Create instance if supported
    if (browserSupportsSpeechRecognition()) {
      const instance = createRecognitionInstance();
      if (instance) {
        instance.continuous = true;
        instance.interimResults = true;
        instance.lang = 'en-US';
        
        // Set up event handlers
        instance.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          setTranscript((prev) => {
            // If this is a continuation, append; otherwise replace
            if (event.results[current].isFinal) {
              return prev + ' ' + transcriptResult;
            }
            return prev;
          });
        };
        
        instance.onerror = (event) => {
          console.error('Speech recognition error', event);
          setListening(false);
        };
        
        instance.onend = () => {
          setListening(false);
        };
        
        setRecognition(instance);
      }
    }
    
    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);
  
  // Start listening
  const startListening = useCallback(() => {
    if (recognition && !listening) {
      try {
        recognition.start();
        setListening(true);
      } catch (err) {
        console.error('Error starting speech recognition', err);
      }
    }
  }, [recognition, listening]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && listening) {
      recognition.stop();
      setListening(false);
    }
  }, [recognition, listening]);
  
  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);
  
  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition: isSupported,
  };
}; 