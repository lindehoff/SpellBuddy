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
          <p className="text-xl text-gray-700 font-medium">Loading...</p>
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
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-medium text-indigo-700">Analyzing your progress...</p>
        <p className="text-gray-600 mt-2">We're creating your personalized progress report.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 font-medium">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!progress) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">No Progress Yet</h2>
          <p className="text-gray-800 mb-6">
            You haven't completed any exercises yet. Start practicing to see your progress!
          </p>
          <button
            onClick={() => router.push('/practice')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Start Practicing
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">Your Progress</h1>
      
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
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300 mb-8">
          <h3 className="text-xl font-bold text-indigo-700 mb-3">Current Streak</h3>
          <div className="flex items-center justify-center">
            <div className="text-5xl text-orange-500 mr-3">🔥</div>
            <div className="text-4xl font-bold text-indigo-700">{progress.streak}</div>
            <div className="ml-2 text-gray-700">days in a row</div>
          </div>
          <p className="text-center text-gray-600 mt-2">
            Keep practicing daily to maintain your streak!
          </p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-300">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">Summary</h2>
        <p className="text-gray-800 mb-4">{progress.summary}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-xl font-bold text-green-600 mb-3">Your Strengths</h2>
          <p className="text-gray-800">{progress.strengths}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          <h2 className="text-xl font-bold text-amber-600 mb-3">Areas to Focus On</h2>
          <p className="text-gray-800">{progress.challenges}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-300">
        <h2 className="text-xl font-bold text-indigo-600 mb-3">Learning Tips</h2>
        <ul className="list-disc pl-6 space-y-2">
          {progress.tips.map((tip, index) => (
            <li key={index} className="text-gray-800">{tip}</li>
          ))}
        </ul>
      </div>
      
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <p className="text-indigo-800 font-medium text-center">{progress.encouragement}</p>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/practice')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
        >
          Continue Practicing
        </button>
      </div>
    </div>
  );
} 