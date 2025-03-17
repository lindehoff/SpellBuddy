"use client";

import { useState, useEffect, useCallback } from 'react';

// Define the SpeechRecognitionInterface using the types from our declaration file
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

// Check if browser supports SpeechRecognition
const browserSupportsSpeechRecognition = () => {
  return !!(
    typeof window !== 'undefined' &&
    (window as Window & { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition ||
    (window as Window & { mozSpeechRecognition?: unknown }).mozSpeechRecognition ||
    (window as Window & { msSpeechRecognition?: unknown }).msSpeechRecognition
  );
};

// Create SpeechRecognition instance
const createRecognitionInstance = (): SpeechRecognitionInterface | null => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognitionAPI = 
    (window as Window & { SpeechRecognition?: new () => SpeechRecognitionInterface }).SpeechRecognition ||
    (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionInterface }).webkitSpeechRecognition ||
    (window as Window & { mozSpeechRecognition?: new () => SpeechRecognitionInterface }).mozSpeechRecognition ||
    (window as Window & { msSpeechRecognition?: new () => SpeechRecognitionInterface }).msSpeechRecognition;
  
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
    const supported = browserSupportsSpeechRecognition();
    setIsSupported(supported);
    
    if (supported) {
      try {
        const instance = createRecognitionInstance();
        if (instance) {
          instance.continuous = false; // Changed to false to better handle single utterances
          instance.interimResults = true;
          instance.lang = 'en-US';
          
          // Set up event handlers
          instance.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscript += result[0].transcript;
              } else {
                interimTranscript += result[0].transcript;
              }
            }
            
            setTranscript(finalTranscript || interimTranscript);
          };
          
          instance.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setListening(false);
          };
          
          instance.onend = () => {
            console.log('Speech recognition ended');
            setListening(false);
          };
          
          setRecognition(instance);
        }
      } catch (err) {
        console.error('Error initializing speech recognition:', err);
        setIsSupported(false);
      }
    }
    
    // Cleanup
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (err) {
          console.error('Error stopping recognition during cleanup:', err);
        }
      }
    };
  }, []); // Removed recognition from dependencies to prevent recreation
  
  // Start listening
  const startListening = useCallback(() => {
    if (recognition && !listening) {
      try {
        console.log('Starting speech recognition...');
        recognition.start();
        setListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setListening(false);
        
        // Try to recreate the recognition instance if it failed
        try {
          const instance = createRecognitionInstance();
          if (instance) {
            instance.continuous = false;
            instance.interimResults = true;
            instance.lang = 'en-US';
            
            instance.onresult = (event) => {
              let finalTranscript = '';
              let interimTranscript = '';
              
              for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                  finalTranscript += result[0].transcript;
                } else {
                  interimTranscript += result[0].transcript;
                }
              }
              
              setTranscript(finalTranscript || interimTranscript);
            };
            
            instance.onerror = (event) => {
              console.error('Speech recognition error:', event.error);
              setListening(false);
            };
            
            instance.onend = () => {
              console.log('Speech recognition ended');
              setListening(false);
            };
            
            setRecognition(instance);
            
            // Try to start again
            setTimeout(() => {
              try {
                instance.start();
                setListening(true);
              } catch (startErr) {
                console.error('Error starting recreated speech recognition:', startErr);
                setListening(false);
              }
            }, 100);
          }
        } catch (recreateErr) {
          console.error('Error recreating speech recognition:', recreateErr);
        }
      }
    }
  }, [recognition, listening]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && listening) {
      try {
        console.log('Stopping speech recognition...');
        recognition.stop();
        setListening(false);
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
        setListening(false);
      }
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