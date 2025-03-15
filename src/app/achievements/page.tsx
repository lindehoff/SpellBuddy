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
  
  // Remove the redirect to login
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, authLoading, router]);
  
  // Fetch all achievements
  useEffect(() => {
    async function fetchAchievements() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/achievements');
        
        if (!response.ok) {
          throw new Error('Failed to fetch achievements');
        }
        
        const data = await response.json();
        console.log(`Received ${data.achievements?.length || 0} achievements from API`);
        setAchievements(data.achievements || []);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Failed to load achievements. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    // Fetch achievements regardless of authentication status
    fetchAchievements();
  }, []);
  
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
  
  // Remove the early return for unauthenticated users
  // if (!user) {
  //   return null; // Will redirect in the useEffect
  // }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="animate-spin h-16 w-16 border-4 border-cyan-400 rounded-full border-t-transparent mb-6"></div>
        <p className="text-xl font-medium gradient-text">Loading achievements...</p>
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
    'streak': '🔥 Streak Achievements',
    'exercises': '📝 Exercise Achievements',
    'perfect_exercises': '✨ Perfect Exercise Achievements',
    'correct_words': '🔤 Word Achievements',
    'level': '🏆 Level Achievements',
    'challenges': '🧩 Challenge Achievements',
    'accuracy': '🎯 Accuracy Achievements',
    'time': '⏱️ Time-based Achievements',
    'difficulty_beginner': '🔰 Beginner Difficulty Achievements',
    'difficulty_intermediate': '🔰 Intermediate Difficulty Achievements',
    'difficulty_advanced': '🔰 Advanced Difficulty Achievements',
    'difficulty_expert': '🔰 Expert Difficulty Achievements',
    'other': '🎯 Other Achievements',
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        <h1 className="text-4xl font-bold gradient-text mb-8 text-center font-poppins">Achievements</h1>
        
        {!user && (
          <div className="glass-card p-6 rounded-xl mb-8 text-center">
            <p className="mb-4">Sign in to track your achievements!</p>
            <button
              onClick={() => router.push('/login')}
              className="shine-button text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105 mr-4"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/register')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Register
            </button>
          </div>
        )}
        
        {achievements.length === 0 ? (
          <div className="glass-card p-8 rounded-xl text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold gradient-text mb-6">No Achievements Available</h2>
            <p className="mb-8 text-lg opacity-90">
              There seems to be an issue loading achievements. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="shine-button text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Refresh Page
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(achievementsByType).map(([type, typeAchievements]) => (
              <div key={type} className="glass-card p-8 rounded-xl">
                <h2 className="text-2xl font-bold gradient-text mb-6 font-poppins">{typeNames[type] || type}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {typeAchievements.map(achievement => (
                    <div 
                      key={achievement.id} 
                      className={`glass-card p-6 rounded-xl ${achievement.unlockedAt ? 'bg-white/10' : 'opacity-70'} transition-all duration-300 hover:transform hover:scale-105`}
                    >
                      <div className="flex items-center mb-4">
                        <div className="text-5xl mr-4">{achievement.icon}</div>
                        <h3 className="text-xl font-bold text-cyan-300">{achievement.name}</h3>
                      </div>
                      <p className="mb-4 opacity-90">{achievement.description}</p>
                      
                      {achievement.unlockedAt ? (
                        <p className="text-sm text-cyan-300 font-medium">
                          Unlocked on {new Date(achievement.unlockedAt * 1000).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-sm opacity-70">Not yet unlocked</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push('/progress')}
            className="shine-button text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105"
          >
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
} 