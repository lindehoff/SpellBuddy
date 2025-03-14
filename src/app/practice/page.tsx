"use client";

import { useState, useEffect } from 'react';
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
  PracticeWords
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
  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const [currentWordAttempts, setCurrentWordAttempts] = useState(0);
  
  // Use our custom speech recognition hook
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Load a new exercise when the component mounts
  useEffect(() => {
    async function loadExercise() {
      try {
        setIsLoadingExercise(true);
        setExercise(null); // Clear previous exercise while loading
        resetTranscript(); // Clear any previous transcript
        setWrittenTranslation(''); // Clear any previous written translation
        
        const response = await fetch('/api/exercises', {
          method: 'POST',
        });
        
        if (response.status === 401) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to load exercise');
        }
        
        const data = await response.json();
        setExercise(data);
        setStep(PracticeStep.ShowSwedishText);
      } catch (err) {
        setError('Failed to load exercise. Please try again.');
        console.error(err);
      } finally {
        setIsLoadingExercise(false);
      }
    }
    
    if (user) {
      loadExercise();
    }
  }, [user, router, resetTranscript]);

  // Update spoken translation when transcript changes
  useEffect(() => {
    // We're just using transcript directly now, no need for a separate state
  }, [transcript, step]);

  // Stop speech recognition and save the spoken translation
  const handleStopListening = async () => {
    stopListening();
    
    if (!exercise) return;
    
    try {
      await fetch(`/api/exercises/${exercise.id}/spoken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spokenText: transcript }),
      });
      
      setStep(PracticeStep.WriteTranslation);
    } catch (err) {
      setError('Failed to save spoken translation. Please try again.');
      console.error(err);
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
      setSpellingResult(result);
      
      if (result.misspelledWords && result.misspelledWords.length > 0) {
        setStep(PracticeStep.ShowResults);
      } else {
        // No spelling errors, go to completion
        router.push('/progress');
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
    
    // Increment attempt counter
    setCurrentWordAttempts(currentWordAttempts + 1);
    
    if (currentWordAttempt.trim().toLowerCase() === currentWord.correct.toLowerCase()) {
      // Word is correct, mark it as learned
      try {
        await fetch(`/api/exercises/${exercise?.id}/words`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word: currentWord.correct }),
        });
        
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
      // Word is incorrect, show error but let them try again
      setError(`That&apos;s not quite right. Try again!`);
      setTimeout(() => setError(''), 2000);
    }
  };

  // Move to the next word after showing the answer
  const moveToNextWord = async () => {
    if (!spellingResult || !spellingResult.misspelledWords) return;
    
    const currentWord = spellingResult.misspelledWords[currentWordIndex];
    
    try {
      // Still record the word for future practice
      await fetch(`/api/exercises/${exercise?.id}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: currentWord.correct }),
      });
      
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
  };

  // Render different content based on the current step
  const renderStepContent = () => {
    // Show loading spinner when loading an exercise
    if (isLoadingExercise) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-medium gradient-text">Creating your exercise...</p>
          <p className="opacity-80 mt-2">This may take a moment as we personalize it for you ✨</p>
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
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4 sm:mb-6">Speak your translation 🎙️</h2>
            <div className="glass-card p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
              <p className="opacity-90 mb-3 sm:mb-4 font-medium">Original text:</p>
              <p className="mb-6 sm:mb-8 font-medium practice-mode-text">{exercise?.original}</p>
              
              <div className="mb-5 sm:mb-6">
                <p className="opacity-90 mb-2 font-medium">Your spoken translation:</p>
                <p className="min-h-16 p-3 sm:p-4 bg-white/10 border border-white/20 rounded-lg">
                  {transcript || "Start speaking..."}
                </p>
              </div>
              
              {!browserSupportsSpeechRecognition && (
                <p className="text-red-300 mb-4 font-medium">
                  ⚠️ Your browser doesn&apos;t support speech recognition.
                  Please try a different browser like Chrome.
                </p>
              )}
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {!listening ? (
                  <button
                    onClick={startListening}
                    disabled={!browserSupportsSpeechRecognition}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:bg-green-800/30"
                  >
                    🎤 Start Speaking
                  </button>
                ) : (
                  <button
                    onClick={handleStopListening}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    ⏹️ Stop Speaking
                  </button>
                )}
                
                <button
                  onClick={resetTranscript}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  🔄 Reset
                </button>
              </div>
              
              <div className="mt-5 sm:mt-6">
                <button
                  onClick={() => setStep(PracticeStep.WriteTranslation)}
                  className="shine-button text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Continue to Writing ✏️
                </button>
              </div>
            </div>
          </div>
        );
        
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
                  onChange={(e) => setWrittenTranslation(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-colors duration-200"
                  rows={4}
                  placeholder="Type your translation here..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                ></textarea>
                
                <div className="text-xs opacity-70 italic">
                  <p>Note: Autocorrect and spell-check are disabled to help you practice your spelling skills.</p>
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
        if (!spellingResult || !spellingResult.misspelledWords || spellingResult.misspelledWords.length === 0) {
          return null;
        }
        
        const currentWord = spellingResult.misspelledWords[currentWordIndex];
        const showAnswer = currentWordAttempts >= 5;
        
        return (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4 sm:mb-6">
              Practice Word {currentWordIndex + 1} of {spellingResult.misspelledWords.length} 🔤
            </h2>
            <div className="glass-card p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
              <div className="mb-5 sm:mb-6">
                <p className="opacity-90 mb-2 font-medium">Remember this tip:</p>
                <p className="mb-5 sm:mb-6 p-3 sm:p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-sm sm:text-base">
                  {currentWord.tip}
                </p>
                
                <p className="opacity-90 mb-2 font-medium">You spelled it as:</p>
                <p className="text-base sm:text-lg mb-5 sm:mb-6 line-through text-red-300 font-medium">
                  {currentWord.misspelled}
                </p>
                
                {showAnswer ? (
                  <div className="mb-5 sm:mb-6">
                    <p className="opacity-90 mb-2 font-medium">The correct spelling is:</p>
                    <p className="text-xl sm:text-2xl mb-5 sm:mb-6 text-green-300 font-bold">
                      {currentWord.correct}
                    </p>
                    <button
                      onClick={moveToNextWord}
                      className="shine-button text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                    >
                      {currentWordIndex < spellingResult.misspelledWords.length - 1 ? 'Next Word ➡️' : 'Finish Practice 🎉'}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="opacity-90 mb-2 font-medium">Now try to spell it correctly:</p>
                    <p className="text-sm opacity-70 mb-2">Attempt {currentWordAttempts + 1} of 5</p>
                    <input
                      type="text"
                      value={currentWordAttempt}
                      onChange={(e) => setCurrentWordAttempt(e.target.value)}
                      className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-lg text-base sm:text-lg text-center text-white placeholder-white/50"
                      placeholder="Type the correct spelling..."
                    />
                    
                    {error && (
                      <p className="text-red-300 mt-4 mb-2 font-medium">{error}</p>
                    )}
                    
                    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
                      <button
                        onClick={checkWordAttempt}
                        disabled={!currentWordAttempt.trim()}
                        className="shine-button text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        Check ✓
                      </button>
                      
                      {currentWordAttempts >= 2 && (
                        <button
                          onClick={() => setCurrentWordAttempts(5)} // Force show answer
                          className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                        >
                          Show Answer 👁️
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
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
        
        {error && step !== PracticeStep.PracticeWords && (
          <div className="bg-red-500/20 text-red-300 p-3 sm:p-4 rounded-xl mb-5 sm:mb-6 border border-red-500/20">
            ⚠️ {error}
          </div>
        )}
        
        {renderStepContent()}
      </div>
    </div>
  );
}

// Main component that ensures client-side only rendering for speech recognition
export default function PracticePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
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
      <PracticePageInner />
    </SpeechRecognitionProvider>
  );
} 