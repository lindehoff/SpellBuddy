"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Exercise, SpellingResult } from '@/lib/service';
import { useSpeechRecognition } from '@/lib/speech-recognition';
import { useAuth } from '@/lib/auth-context';

enum PracticeStep {
  Loading,
  ShowSwedishText,
  SpeakTranslation,
  WriteTranslation,
  ShowResults,
  PracticeWords,
  Summary
}

// Create a component wrapper for speech recognition
function SpeechRecognitionProvider({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Only render children on the client
  if (!hasMounted) {
    return <div className="flex justify-center py-4 opacity-80">Loading speech recognition...</div>;
  }

  return <>{children}</>;
}

// Inner component that uses speech recognition
function PracticePageInner() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<PracticeStep>(PracticeStep.Loading);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [writtenTranslation, setWrittenTranslation] = useState('');
  const [spellingResult, setSpellingResult] = useState<SpellingResult | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordAttempt, setCurrentWordAttempt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingExercise, setIsLoadingExercise] = useState(false);
  const [currentWordAttempts, setCurrentWordAttempts] = useState(0);
  const fetchedRef = useRef(false);
  const [dictationEnabled, setDictationEnabled] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [newAchievements, setNewAchievements] = useState<{id: number, name: string, description: string, icon: string}[]>([]);
  
  // Initialize dictation preference from localStorage only after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dictationEnabled');
      setDictationEnabled(saved !== null ? saved === 'true' : true);
    }
  }, []);
  
  // Save dictation preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dictationEnabled', dictationEnabled.toString());
    }
  }, [dictationEnabled]);
  
  // Detect and prevent dictation in the textarea
  useEffect(() => {
    if (step === PracticeStep.WriteTranslation) {
      // Function to detect rapid text input that might be from dictation
      const handleTextareaInput = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        const currentLength = target.value.length;
        const previousLength = writtenTranslation.length;
        
        // If a large amount of text is added at once, it might be dictation
        if (currentLength - previousLength > 15) {
          // Show a warning
          setError('Please type your translation manually. Dictation is not allowed in practice mode.');
          
          // Clear the error after 3 seconds
          setTimeout(() => setError(''), 3000);
        }
      };
      
      // Add event listener to detect dictation
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('input', handleTextareaInput);
        
        // Disable speech input methods
        const disableSpeechInput = () => {
          // This helps prevent some mobile dictation features
          if (document.activeElement === textarea) {
            (document.activeElement as HTMLElement).blur();
            setTimeout(() => textarea.focus(), 10);
          }
        };
        
        // Listen for speech input start events
        textarea.addEventListener('webkitspeechstart', disableSpeechInput);
        textarea.addEventListener('speechstart', disableSpeechInput);
        
        // Periodically check for rapid input changes that might indicate dictation
        const intervalCheck = setInterval(() => {
          if (document.activeElement === textarea) {
            const currentVal = textarea.value;
            if (currentVal.length > writtenTranslation.length + 15) {
              setWrittenTranslation(currentVal.substring(0, writtenTranslation.length));
              setError('Please type your translation manually. Dictation is not allowed in practice mode.');
              setTimeout(() => setError(''), 3000);
            }
          }
        }, 500);
        
        // Clean up
        return () => {
          textarea.removeEventListener('input', handleTextareaInput);
          textarea.removeEventListener('webkitspeechstart', disableSpeechInput);
          textarea.removeEventListener('speechstart', disableSpeechInput);
          clearInterval(intervalCheck);
        };
      }
    }
  }, [step, writtenTranslation]);
  
  // Use our custom speech recognition hook
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Set loading state after component has mounted
  useEffect(() => {
    // Only set loading state if we don't have an exercise and haven't fetched yet
    if (!exercise && !fetchedRef.current && !isLoadingExercise) {
      console.log('Setting initial loading state');
      setIsLoadingExercise(true);
    }
  }, [exercise, fetchedRef, isLoadingExercise]);
  
  // Load a new exercise when the component mounts
  useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout | null = null;
    
    const loadExercise = async () => {
      // Skip if we don't have a user, are not loading, already have an exercise, or already fetched
      if (!user || !isLoadingExercise || exercise || fetchedRef.current) {
        console.log('Skipping exercise load because:', {
          noUser: !user,
          notLoading: !isLoadingExercise,
          hasExercise: !!exercise,
          alreadyFetched: fetchedRef.current
        });
        return;
      }

      try {
        console.log('Starting to load exercise...');
        fetchedRef.current = true;
        
        // Set a timeout to prevent infinite loading
        loadingTimeout = setTimeout(() => {
          if (isMounted) {
            console.log('Loading timeout reached');
            setIsLoadingExercise(false);
            setError('Loading timed out. Please try again.');
          }
        }, 10000);
        
        console.log('Making POST request to /api/exercises');
        const response = await fetch('/api/exercises', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Clear timeout since we got a response
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
        
        console.log('Received response:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });
        
        // Check if component is still mounted
        if (!isMounted) {
          console.log('Component unmounted during fetch, aborting');
          return;
        }
        
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to load exercise: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Parsed response data:', {
          success: data.success,
          hasData: !!data.data,
          exerciseId: data.data?.id
        });
        
        // Check if component is still mounted
        if (!isMounted) {
          console.log('Component unmounted after parsing data, aborting');
          return;
        }
        
        if (!data.success || !data.data) {
          throw new Error('Invalid response format');
        }
        
        console.log('Exercise loaded successfully:', data.data.id);
        setExercise(data.data);
        setStep(PracticeStep.ShowSwedishText);
        setIsLoadingExercise(false);
      } catch (err) {
        // Check if component is still mounted
        if (!isMounted) {
          console.log('Component unmounted during error handling, aborting');
          return;
        }
        
        console.error('Error loading exercise:', err);
        setError('Failed to load exercise. Please try again.');
        
        // Reset after error to allow retry
        fetchedRef.current = false;
        setIsLoadingExercise(false);
      }
    };

    // Only load if we have a user, are loading, don't have an exercise, and haven't fetched
    if (user && isLoadingExercise && !exercise && !fetchedRef.current) {
      console.log('Initiating exercise load...');
      loadExercise();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      console.log('Cleaning up exercise load effect');
    };
  }, [user, router, exercise, isLoadingExercise]);

  // Reset state when starting a new exercise
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetExerciseState = useCallback(() => {
    console.log('Resetting exercise state');
    setExercise(null);
    setWrittenTranslation('');
    resetTranscript();
    setSpellingResult(null);
    setCurrentWordIndex(0);
    setCurrentWordAttempt('');
    setCurrentWordAttempts(0);
    setError('');
    setIsLoadingExercise(false);
    fetchedRef.current = false;
  }, [resetTranscript]);

  // Force a retry
  const forceRetry = useCallback(() => {
    console.log('Forcing retry');
    setError('');
    fetchedRef.current = false;
    setIsLoadingExercise(true);
  }, []);

  // Update spoken translation when transcript changes
  useEffect(() => {
    // We're just using transcript directly now, no need for a separate state
  }, [transcript, step]);

  // Stop speech recognition and save the spoken translation
  const handleStopListening = async () => {
    console.log('Handling stop listening...');
    stopListening();
    
    if (!exercise || !exercise.id) {
      console.error('No exercise found or exercise has no ID');
      setError('Cannot save spoken translation: No active exercise');
      return;
    }
    
    try {
      console.log(`Saving spoken text for exercise ${exercise.id}: "${transcript}"`);
      
      const response = await fetch(`/api/exercises/${exercise.id}/spoken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spokenText: transcript }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save spoken translation:', errorText);
        throw new Error(`Failed to save spoken translation: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Check if the response has the expected format
      if (!result.success) {
        console.error('API returned error:', result.error);
        throw new Error(result.error || 'Failed to save spoken translation');
      }
      
      console.log('Successfully saved spoken translation, moving to write step');
      setStep(PracticeStep.WriteTranslation);
    } catch (err) {
      console.error('Error in handleStopListening:', err);
      setError('Failed to save spoken translation. Please try again.');
    }
  };

  // Submit written translation for evaluation
  const submitWrittenTranslation = async () => {
    if (!exercise || !writtenTranslation.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/exercises/${exercise.id}/written`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ writtenText: writtenTranslation }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to evaluate translation');
      }
      
      const result = await response.json();
      
      // Check if the response has the expected format
      if (result.success && result.data) {
        setSpellingResult(result.data);
        
        if (result.data.misspelledWords && result.data.misspelledWords.length > 0) {
          setStep(PracticeStep.Summary);
        } else {
          // No spelling errors, go to completion
          router.push('/progress');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to evaluate translation. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start practicing misspelled words
  const startPracticingWords = () => {
    setCurrentWordIndex(0);
    setCurrentWordAttempt('');
    setCurrentWordAttempts(0); // Reset attempts counter
    setStep(PracticeStep.PracticeWords);
  };

  // Check if the current word attempt is correct
  const checkWordAttempt = async () => {
    if (!spellingResult || !spellingResult.misspelledWords) return;
    
    const currentWord = spellingResult.misspelledWords[currentWordIndex];
    
    // Normalize both words for comparison
    const normalizeWord = (word: string) => {
      return word.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    };
    
    const attempt = normalizeWord(currentWordAttempt);
    const correct = normalizeWord(currentWord.correct);
    
    // Increment attempt counter
    setCurrentWordAttempts(currentWordAttempts + 1);
    
    if (attempt === correct) {
      // Word is correct, mark it as learned
      try {
        const response = await fetch(`/api/exercises/${exercise?.id}/words`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word: currentWord.correct }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save word progress');
        }
        
        const result = await response.json();
        
        // Check if the response has the expected format
        if (!result.success) {
          throw new Error(result.error || 'Failed to save word progress');
        }
        
        // Move to next word or finish
        if (currentWordIndex < spellingResult.misspelledWords.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setCurrentWordAttempt('');
          setCurrentWordAttempts(0); // Reset attempts for next word
        } else {
          // All words practiced, go to progress page
          router.push('/progress');
        }
      } catch (err) {
        setError('Failed to save word progress. Please try again.');
        console.error(err);
      }
    } else {
      // Word is incorrect
      if (currentWordAttempts >= 4) { // Show answer after 5 attempts
        // Move to next word after showing the answer
        setTimeout(() => {
          if (currentWordIndex < spellingResult.misspelledWords.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
            setCurrentWordAttempt('');
            setCurrentWordAttempts(0);
          } else {
            // All words practiced, go to progress page
            router.push('/progress');
          }
        }, 2000); // Give user time to see the correct answer
      }
    }
  };

  // Move to the next word after showing the answer
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const moveToNextWord = async () => {
    if (!spellingResult || !spellingResult.misspelledWords) return;
    
    const currentWord = spellingResult.misspelledWords[currentWordIndex];
    
    try {
      // Still record the word for future practice
      const response = await fetch(`/api/exercises/${exercise?.id}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: currentWord.correct }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save word progress');
      }
      
      const result = await response.json();
      
      // Check if the response has the expected format
      if (!result.success) {
        throw new Error(result.error || 'Failed to save word progress');
      }
      
      // Move to next word or finish
      if (currentWordIndex < spellingResult.misspelledWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentWordAttempt('');
        setCurrentWordAttempts(0); // Reset attempts for next word
      } else {
        // Mark exercise as completed
        const completeResponse = await fetch(`/api/exercises/${exercise?.id}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!completeResponse.ok) {
          throw new Error('Failed to complete exercise');
        }
        
        const completeResult = await completeResponse.json();
        
        if (!completeResult.success) {
          throw new Error(completeResult.error || 'Failed to complete exercise');
        }
        
        // All words practiced, go to progress page
        router.push('/progress');
      }
    } catch (err) {
      setError('Failed to save progress. Please try again.');
      console.error(err);
    }
  };

  // Component to handle speech recognition
  const SpeakTranslationStep = () => {
    if (!browserSupportsSpeechRecognition) {
      return (
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Sorry, your browser does not support speech recognition.
            Please use Chrome or Edge for this feature.
          </p>
          <button
            onClick={() => setStep(PracticeStep.WriteTranslation)}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Skip to Writing
          </button>
        </div>
      );
    }

    const handleStartListening = () => {
      try {
        console.log('Starting speech recognition...');
        resetTranscript();
        startListening();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start speech recognition. Please try again.');
      }
    };

    const handleStopAndSave = async () => {
      try {
        console.log('Stopping speech recognition...');
        stopListening();
        await handleStopListening();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
        setError('Failed to save spoken translation. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        {/* Show the text to translate */}
        <div className="mb-6 p-4 bg-white/10 rounded-lg">
          <p className="text-lg font-medium practice-mode-text">{exercise?.original}</p>
        </div>
        
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg">
              {listening ? 'Listening...' : 'Click the button and speak your translation'}
            </p>
            
            <button
              onClick={listening ? handleStopAndSave : handleStartListening}
              className={`px-6 py-3 rounded-full text-white font-semibold transition-all ${
                listening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {listening ? 'Stop Speaking' : 'Start Speaking'}
            </button>
          </div>

          {transcript && (
            <div className="mt-4">
              <p className="font-semibold">Your spoken translation:</p>
              <p className="mt-2 text-lg">{transcript}</p>
              
              {/* Add a "Done" button when there's a transcript */}
              <button
                onClick={handleStopAndSave}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Done
              </button>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => setStep(PracticeStep.WriteTranslation)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Skip speaking practice
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Component to handle word practice
  const PracticeWordsStep = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Focus input when component mounts or word changes
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    if (!spellingResult || !spellingResult.misspelledWords) {
      return <div>No words to practice</div>;
    }

    const currentWord = spellingResult.misspelledWords[currentWordIndex];
    const attemptsLeft = 5 - currentWordAttempts;

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkWordAttempt();
      }
    };

    return (
      <div className="text-center space-y-6">
        <div>
          <p className="text-lg mb-2">Practice spelling this word:</p>
          <p className="text-2xl font-bold mb-4">{currentWord.correct}</p>
          <p className="text-sm text-gray-400 mb-4">Attempts left: {attemptsLeft}</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={currentWordAttempt}
            onChange={(e) => setCurrentWordAttempt(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-64 px-4 py-2 text-lg border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type the word..."
            autoFocus
          />

          <button
            onClick={checkWordAttempt}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check
          </button>
        </div>

        {error && (
          <p className="text-red-500">{error}</p>
        )}
      </div>
    );
  };

  // Log component state on mount
  useEffect(() => {
    console.log('PracticePageInner mounted with state:', {
      user: !!user,
      userId: user?.id,
      step,
      isLoadingExercise,
      fetchedRef: fetchedRef.current,
      exercise: !!exercise
    });
    
    return () => {
      console.log('PracticePageInner unmounting');
    };
  }, [user, step, isLoadingExercise, exercise]);
  
  // Log state changes
  useEffect(() => {
    console.log('State changed:', {
      step,
      isLoadingExercise,
      fetchedRef: fetchedRef.current,
      exercise: exercise?.id
    });
  }, [step, isLoadingExercise, exercise, user]);

  // Get current streak when component mounts
  useEffect(() => {
    const getStreak = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/streak');
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentStreak(data.data.currentStreak || 0);
          if (data.data.newAchievements && data.data.newAchievements.length > 0) {
            setNewAchievements(data.data.newAchievements);
          }
        }
      } catch (err) {
        console.error('Error fetching streak:', err);
      }
    };
    
    getStreak();
  }, [user]);

  // Render different content based on the current step
  const renderStepContent = () => {
    // Show loading spinner when loading an exercise
    if (isLoadingExercise) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-medium gradient-text">Creating your exercise...</p>
          <p className="opacity-80 mt-2">This may take a moment as we personalize it for you ✨</p>
          
          {error && (
            <div className="mt-6">
              <button 
                onClick={forceRetry}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      );
    }
    
    switch (step) {
      case PracticeStep.Loading:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Loading your exercise...</p>
          </div>
        );
        
      case PracticeStep.ShowSwedishText:
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4 sm:mb-6">Translate this text 🔄</h2>
            <div className="glass-card p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 text-lg sm:text-xl">
              <p className="font-medium practice-mode-text">{exercise?.original}</p>
            </div>
            <button
              onClick={() => setStep(PracticeStep.SpeakTranslation)}
              className="shine-button text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              I&apos;m ready to translate 🎙️
            </button>
          </div>
        );
        
      case PracticeStep.SpeakTranslation:
        return <SpeakTranslationStep />;
        
      case PracticeStep.WriteTranslation:
        return (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Write the English translation</h2>
              <p className="mb-6 opacity-80">Type the English translation of the Swedish text below:</p>
              
              <div className="mb-4 p-4 bg-white/10 rounded-lg">
                <p className="text-lg font-medium practice-mode-text">{exercise?.original}</p>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={writtenTranslation}
                  onChange={(e) => {
                    // Limit the rate of text input to prevent dictation
                    const newValue = e.target.value;
                    const oldValue = writtenTranslation;
                    
                    // If too many characters are added at once, it might be dictation
                    if (newValue.length > oldValue.length + 5) {
                      setError('Please type your translation manually. Dictation is not allowed in practice mode.');
                      setTimeout(() => setError(''), 3000);
                      // Only accept a reasonable number of new characters
                      setWrittenTranslation(newValue.substring(0, oldValue.length + 5));
                    } else {
                      setWrittenTranslation(newValue);
                    }
                  }}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-colors duration-200 dictation-disabled"
                  rows={4}
                  placeholder="Type your translation here..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                  aria-autocomplete="none"
                  inputMode="text"
                  onContextMenu={(e: React.MouseEvent<HTMLTextAreaElement>) => {
                    // Prevent context menu which might have speech options
                    e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    // Detect keyboard shortcuts that might trigger dictation
                    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                      e.preventDefault();
                      setError('Keyboard shortcuts for dictation are disabled in practice mode.');
                      setTimeout(() => setError(''), 3000);
                    }
                  }}
                ></textarea>
                
                <div className="text-xs opacity-70 italic">
                  <p>Note: Autocorrect, spell-check, and dictation are disabled to help you practice your spelling skills.</p>
                </div>
                
                <button
                  onClick={submitWrittenTranslation}
                  disabled={isSubmitting || !writtenTranslation.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting || !writtenTranslation.trim()
                      ? 'bg-white/10 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </span>
                  ) : (
                    'Submit Translation'
                  )}
                </button>
              </div>
            </div>
          </div>
        );
        
      case PracticeStep.ShowResults:
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4 sm:mb-6">Spelling Results 📊</h2>
            <div className="glass-card p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
              <div className="mb-5 sm:mb-6">
                <p className="opacity-90 mb-2 font-medium">Your spelling score:</p>
                <div className="flex justify-center items-center mb-4">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text">
                    {spellingResult?.overallScore}/10
                  </div>
                </div>
                
                <p className="text-base sm:text-lg mb-5 sm:mb-6 italic font-medium">
                  {spellingResult?.encouragement}
                </p>
              </div>
              
              {spellingResult?.misspelledWords && spellingResult.misspelledWords.length > 0 ? (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold gradient-text mb-4">Words to practice:</h3>
                  <ul className="mb-5 sm:mb-6">
                    {spellingResult.misspelledWords.map((word, index) => (
                      <li key={index} className="mb-4 p-3 sm:p-4 glass-card bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="font-semibold">
                          <span className="line-through text-red-300">{word.misspelled}</span>
                          {' → '}
                          <span className="text-green-300">{word.correct}</span>
                        </p>
                        <p className="opacity-90 mt-1 text-sm sm:text-base">{word.tip}</p>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={startPracticingWords}
                    className="shine-button text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    Practice These Words 🏋️‍♀️
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-5 sm:mb-6 font-medium">Great job! No spelling errors found. 🎉</p>
                  <Link
                    href="/progress"
                    className="shine-button text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105 inline-block w-full sm:w-auto"
                  >
                    View Progress 📈
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
        
      case PracticeStep.PracticeWords:
        return <PracticeWordsStep />;
        
      case PracticeStep.Summary:
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4 sm:mb-6">Exercise Summary 📊</h2>
            <div className="glass-card p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
              <div className="mb-5 sm:mb-6">
                <p className="opacity-90 mb-2 font-medium">Your spelling score:</p>
                <div className="flex justify-center items-center mb-4">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text">
                    {spellingResult?.overallScore}/10
                  </div>
                </div>
                
                <div className="flex justify-center items-center mb-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-xl font-bold text-yellow-400">
                      +{Math.round(spellingResult?.overallScore || 0) * 10} XP Earned!
                    </span>
                  </div>
                </div>
                
                {currentStreak > 0 && (
                  <div className="flex justify-center items-center mb-4 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                      </svg>
                      <span className="text-xl font-bold text-orange-400">
                        {currentStreak} Day Streak! 🔥
                      </span>
                    </div>
                  </div>
                )}
                
                {newAchievements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold gradient-text mb-3">New Achievements Unlocked! 🏆</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {newAchievements.map((achievement, index) => (
                        <div key={index} className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 max-w-xs">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">{achievement.icon}</span>
                            <span className="font-bold text-purple-300">{achievement.name}</span>
                          </div>
                          <p className="text-sm opacity-90">{achievement.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-base sm:text-lg mb-5 sm:mb-6 italic font-medium">
                  {spellingResult?.encouragement}
                </p>
              </div>
              
              {spellingResult?.misspelledWords && spellingResult.misspelledWords.length > 0 ? (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold gradient-text mb-4">Words to practice:</h3>
                  <ul className="mb-5 sm:mb-6">
                    {spellingResult.misspelledWords.map((word, index) => (
                      <li key={index} className="mb-4 p-3 sm:p-4 glass-card bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="font-semibold">
                          <span className="line-through text-red-300">{word.misspelled}</span>
                          {' → '}
                          <span className="text-green-300">{word.correct}</span>
                        </p>
                        <p className="opacity-90 mt-1 text-sm sm:text-base">{word.tip}</p>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={startPracticingWords}
                      className="shine-button text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105"
                    >
                      Practice These Words 🏋️‍♀️
                    </button>
                    
                    <button
                      onClick={completeExercise}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105"
                    >
                      Complete Exercise ✅
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-5 sm:mb-6 font-medium">Great job! No spelling errors found. 🎉</p>
                  <button
                    onClick={completeExercise}
                    className="shine-button text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105 inline-block"
                  >
                    Complete Exercise ✅
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Mark exercise as completed and navigate to progress page
  const completeExercise = async () => {
    if (!exercise || !exercise.id) return;
    
    try {
      // Mark exercise as complete
      const response = await fetch(`/api/exercises/${exercise.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete exercise');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete exercise');
      }
      
      // Update streak
      const streakResponse = await fetch('/api/user/streak', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (streakResponse.ok) {
        const streakData = await streakResponse.json();
        if (streakData.success && streakData.data) {
          setCurrentStreak(streakData.data.currentStreak || 0);
          if (streakData.data.newAchievements && streakData.data.newAchievements.length > 0) {
            setNewAchievements(streakData.data.newAchievements);
          }
        }
      }
      
      // Navigate to progress page
      router.push('/progress');
    } catch (err) {
      setError('Failed to complete exercise. Please try again.');
      console.error(err);
    }
  };

  return (
    <>
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 sm:left-20 w-48 sm:w-64 h-48 sm:h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 sm:right-20 w-64 sm:w-80 h-64 sm:h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-3xl mx-auto glass-card rounded-xl p-4 sm:p-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            ← Back to Home
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
            SpellBuddy Practice 🧙‍♂️
          </h1>
        </div>
        
        {step === PracticeStep.WriteTranslation && (
          <div className="bg-yellow-500/20 text-yellow-300 p-3 sm:p-4 rounded-xl mb-5 sm:mb-6 border border-yellow-500/20">
            <p className="font-medium">⚠️ Important: Please type your translation manually.</p>
            <p className="text-sm mt-1 opacity-80">Using dictation or speech-to-text is not allowed in practice mode as it defeats the purpose of spelling practice.</p>
          </div>
        )}
        
        {error && step !== PracticeStep.PracticeWords && (
          <div className="bg-red-500/20 text-red-300 p-3 sm:p-4 rounded-xl mb-5 sm:mb-6 border border-red-500/20">
            ⚠️ {error}
          </div>
        )}
        
        {renderStepContent()}
      </div>
    </>
  );
}

// Main component that ensures client-side only rendering for speech recognition
export default function PracticePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  
  // Force a retry by incrementing the retry count
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    console.log('Forcing retry, count:', retryCount + 1);
  }, [retryCount]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-cyan-400 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <SpeechRecognitionProvider>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative">
        {/* Simple retry button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleRetry}
            className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full transition-colors"
            title="Refresh practice"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <PracticePageInner key={`practice-${retryCount}`} />
      </div>
    </SpeechRecognitionProvider>
  );
} 