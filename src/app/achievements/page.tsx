'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Achievement } from '@/lib/service';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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
  
  // Fetch all achievements
  useEffect(() => {
    async function fetchAchievements() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/achievements');
        
        if (response.status === 401) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch achievements');
        }
        
        const data = await response.json();
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Failed to load achievements. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchAchievements();
    }
  }, [user, router]);
  
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
        <p className="text-xl font-medium text-indigo-700">Loading achievements...</p>
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
  
  // Group achievements by type
  const achievementsByType: Record<string, Achievement[]> = {};
  
  achievements.forEach(achievement => {
    const type = achievement.achievementType || 'other';
    if (!achievementsByType[type]) {
      achievementsByType[type] = [];
    }
    achievementsByType[type].push(achievement);
  });
  
  // Get type display names
  const typeNames: Record<string, string> = {
    'streak': 'Streak Achievements',
    'exercises': 'Exercise Achievements',
    'perfect_exercises': 'Perfect Exercise Achievements',
    'correct_words': 'Word Achievements',
    'level': 'Level Achievements',
    'challenges': 'Challenge Achievements',
    'other': 'Other Achievements',
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">Achievements</h1>
      
      {achievements.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 text-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">No Achievements Yet</h2>
          <p className="text-gray-800 mb-6">
            Complete exercises and practice regularly to unlock achievements!
          </p>
          <button
            onClick={() => router.push('/practice')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Start Practicing
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(achievementsByType).map(([type, typeAchievements]) => (
            <div key={type} className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">{typeNames[type] || type}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeAchievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg border ${achievement.unlockedAt ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-70'}`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="text-4xl mr-3">{achievement.icon}</div>
                      <h3 className="text-lg font-semibold text-indigo-700">{achievement.name}</h3>
                    </div>
                    <p className="text-gray-700 mb-2">{achievement.description}</p>
                    
                    {achievement.unlockedAt ? (
                      <p className="text-sm text-green-600 font-medium">
                        Unlocked on {new Date(achievement.unlockedAt * 1000).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Not yet unlocked</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/progress')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
        >
          View Progress
        </button>
      </div>
    </div>
  );
} 