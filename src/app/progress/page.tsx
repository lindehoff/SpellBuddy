"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/lib/service';
import { useAuth } from '@/lib/auth-context';
import AchievementDisplay from '@/components/AchievementDisplay';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Fetch progress data
  useEffect(() => {
    async function fetchProgress() {
      try {
        setLoading(true);
        setProgress(null); // Clear previous progress data while loading
        
        const response = await fetch('/api/progress');
        
        if (response.status === 401) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }
        
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchProgress();
    }
  }, [user, router]);
  
  // Mark achievements as seen
  const handleAchievementsSeen = async (achievementIds: number[]) => {
    if (!achievementIds.length) return;
    
    try {
      await fetch('/api/achievements/seen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievementIds }),
      });
    } catch (err) {
      console.error('Error marking achievements as seen:', err);
    }
  };
  
  if (authLoading) {
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="animate-spin h-16 w-16 border-4 border-cyan-400 rounded-full border-t-transparent mb-6"></div>
        <p className="text-xl font-medium gradient-text">Analyzing your progress...</p>
        <p className="opacity-80 mt-2">We&apos;re creating your personalized progress report.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="glass-card bg-red-500/10 text-red-300 p-6 rounded-xl mb-6 border border-red-500/20 font-medium">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="shine-button text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!progress) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="glass-card p-8 rounded-xl text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold gradient-text mb-6">No Progress Yet</h2>
          <p className="mb-8 text-lg opacity-90">
            You haven&apos;t completed any exercises yet. Start practicing to see your progress!
          </p>
          <button
            onClick={() => router.push('/practice')}
            className="shine-button text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Start Practicing
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        <h1 className="text-4xl font-bold gradient-text mb-8 text-center font-poppins">Your Progress</h1>
        
        {/* Gamification Elements */}
        {progress.level && progress.experiencePoints && progress.nextLevelPoints && (
          <AchievementDisplay
            level={progress.level}
            experiencePoints={progress.experiencePoints}
            nextLevelPoints={progress.nextLevelPoints}
            achievements={progress.achievements || []}
            onAchievementsSeen={handleAchievementsSeen}
          />
        )}
        
        {/* Streak Display */}
        {progress.streak !== undefined && progress.streak > 0 && (
          <div className="glass-card p-6 rounded-xl mb-8 animate-float">
            <h3 className="text-xl font-bold gradient-text mb-4">Current Streak</h3>
            <div className="flex items-center justify-center">
              <div className="text-6xl mr-4">🔥</div>
              <div className="text-5xl font-bold gradient-text">{progress.streak}</div>
              <div className="ml-3 text-xl opacity-90">days in a row</div>
            </div>
            <p className="text-center opacity-80 mt-4">
              Keep practicing daily to maintain your streak!
            </p>
          </div>
        )}
        
        <div className="glass-card p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-bold gradient-text mb-4">Summary</h2>
          <p className="opacity-90 text-lg">{progress.summary}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:bg-white/10">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">Your Strengths</h2>
            <p className="opacity-90">{progress.strengths}</p>
          </div>
          
          <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:bg-white/10">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">Areas to Focus On</h2>
            <p className="opacity-90">{progress.challenges}</p>
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-xl mb-8">
          <h2 className="text-xl font-bold gradient-text mb-4">Learning Tips</h2>
          <ul className="list-disc pl-6 space-y-3">
            {progress.tips.map((tip, index) => (
              <li key={index} className="opacity-90">{tip}</li>
            ))}
          </ul>
        </div>
        
        <div className="glass-card p-6 rounded-xl bg-white/10 mb-8">
          <p className="font-medium text-center text-lg gradient-text">{progress.encouragement}</p>
        </div>
        
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push('/practice')}
            className="shine-button text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Continue Practicing
          </button>
        </div>
      </div>
    </div>
  );
} 