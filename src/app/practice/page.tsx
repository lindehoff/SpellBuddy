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
    return <div className="flex justify-center py-4">Loading speech recognition...</div>;
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
  const [spokenTranslation, setSpokenTranslation] = useState('');
  const [spellingResult, setSpellingResult] = useState<SpellingResult | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordAttempt, setCurrentWordAttempt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
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
      }
    }
    
    if (user) {
      loadExercise();
    }
  }, [user, router]);

  // Update spoken translation when transcript changes
  useEffect(() => {
    if (step === PracticeStep.SpeakTranslation) {
      setSpokenTranslation(transcript);
    }
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
    setStep(PracticeStep.PracticeWords);
  };

  // Check if the current word attempt is correct
  const checkWordAttempt = async () => {
    if (!spellingResult || !spellingResult.misspelledWords) return;
    
    const currentWord = spellingResult.misspelledWords[currentWordIndex];
    
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
      setError(`That's not quite right. Try again!`);
      setTimeout(() => setError(''), 2000);
    }
  };

  // Render different content based on the current step
  const renderStepContent = () => {
    switch (step) {
      case PracticeStep.Loading:
        return (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Loading your exercise...</p>
          </div>
        );
        
      case PracticeStep.ShowSwedishText:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Translate this text</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-xl border border-gray-300">
              <p className="text-gray-900 font-medium">{exercise?.original}</p>
            </div>
            <button
              onClick={() => setStep(PracticeStep.SpeakTranslation)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
            >
              I'm ready to translate
            </button>
          </div>
        );
        
      case PracticeStep.SpeakTranslation:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Speak your translation</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-300">
              <p className="text-gray-700 mb-4 font-medium">Original text:</p>
              <p className="text-gray-900 mb-8 font-medium">{exercise?.original}</p>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2 font-medium">Your spoken translation:</p>
                <p className="text-gray-900 min-h-16 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {transcript || "Start speaking..."}
                </p>
              </div>
              
              {!browserSupportsSpeechRecognition && (
                <p className="text-red-600 mb-4 font-medium">
                  Your browser doesn't support speech recognition.
                  Please try a different browser like Chrome.
                </p>
              )}
              
              <div className="flex justify-center gap-4">
                {!listening ? (
                  <button
                    onClick={startListening}
                    disabled={!browserSupportsSpeechRecognition}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-green-300"
                  >
                    Start Speaking
                  </button>
                ) : (
                  <button
                    onClick={handleStopListening}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Stop Speaking
                  </button>
                )}
                
                <button
                  onClick={resetTranscript}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setStep(PracticeStep.WriteTranslation)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Continue to Writing
                </button>
              </div>
            </div>
          </div>
        );
        
      case PracticeStep.WriteTranslation:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Write your translation</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-300">
              <p className="text-gray-700 mb-4 font-medium">Original text:</p>
              <p className="text-gray-900 mb-8 font-medium">{exercise?.original}</p>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2 font-medium">Your spoken translation:</p>
                <p className="text-gray-900 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {spokenTranslation || transcript}
                </p>
                
                <p className="text-gray-700 mb-2 font-medium">Now write it out:</p>
                <textarea
                  value={writtenTranslation}
                  onChange={(e) => setWrittenTranslation(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg text-lg min-h-32 text-gray-900"
                  placeholder="Type your translation here..."
                />
              </div>
              
              <button
                onClick={submitWrittenTranslation}
                disabled={isSubmitting || !writtenTranslation.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 disabled:bg-indigo-300"
              >
                {isSubmitting ? 'Checking...' : 'Check Spelling'}
              </button>
            </div>
          </div>
        );
        
      case PracticeStep.ShowResults:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Spelling Results</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-6">
                <p className="text-gray-700 mb-2 font-medium">Your score:</p>
                <div className="flex justify-center items-center mb-4">
                  <div className="text-4xl font-bold text-indigo-600">
                    {spellingResult?.overallScore}/10
                  </div>
                </div>
                
                <p className="text-lg mb-6 italic font-medium">
                  {spellingResult?.encouragement}
                </p>
              </div>
              
              {spellingResult?.misspelledWords && spellingResult.misspelledWords.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Words to practice:</h3>
                  <ul className="mb-6">
                    {spellingResult.misspelledWords.map((word, index) => (
                      <li key={index} className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="font-semibold">
                          <span className="line-through text-red-600">{word.misspelled}</span>
                          {' → '}
                          <span className="text-green-600">{word.correct}</span>
                        </p>
                        <p className="text-gray-800 mt-1">{word.tip}</p>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={startPracticingWords}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
                  >
                    Practice These Words
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-6 font-medium">Great job! No spelling errors found.</p>
                  <Link
                    href="/progress"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
                  >
                    View Progress
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
        
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">
              Practice Word {currentWordIndex + 1} of {spellingResult.misspelledWords.length}
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-300">
              <div className="mb-6">
                <p className="text-gray-700 mb-2 font-medium">Remember this tip:</p>
                <p className="text-gray-900 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  {currentWord.tip}
                </p>
                
                <p className="text-gray-700 mb-2 font-medium">You spelled it as:</p>
                <p className="text-lg mb-6 line-through text-red-600 font-medium">
                  {currentWord.misspelled}
                </p>
                
                <p className="text-gray-700 mb-2 font-medium">Now try to spell it correctly:</p>
                <input
                  type="text"
                  value={currentWordAttempt}
                  onChange={(e) => setCurrentWordAttempt(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg text-lg text-center text-gray-900"
                  placeholder="Type the correct spelling..."
                />
              </div>
              
              {error && (
                <p className="text-red-600 mb-4 font-medium">{error}</p>
              )}
              
              <button
                onClick={checkWordAttempt}
                disabled={!currentWordAttempt.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 disabled:bg-indigo-300"
              >
                Check
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-300">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            ← Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-indigo-700">
            SpellBuddy Practice
          </h1>
        </div>
        
        {error && step !== PracticeStep.PracticeWords && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 font-medium">
            {error}
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
          <p className="text-xl text-gray-700">Loading...</p>
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