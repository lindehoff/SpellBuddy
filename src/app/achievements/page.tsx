'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Achievement } from '@/lib/service';
import Link from 'next/link';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(true);
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
    
    if (user) {
      fetchAchievements();
    }
  }, [user]);
  
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
  
  // Filter achievements based on the toggle
  const filteredAchievements = showOnlyUnlocked 
    ? achievements.filter(achievement => achievement.unlockedAt)
    : achievements;
  
  // Group achievements by type
  const achievementsByType: Record<string, Achievement[]> = {};
  
  filteredAchievements.forEach(achievement => {
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
  
  // Count unlocked achievements
  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const totalCount = achievements.length;
  
  console.log(`Unlocked achievements: ${unlockedCount}/${totalCount}`);
  console.log('Unlocked achievement IDs:', achievements.filter(a => a.unlockedAt !== null).map(a => a.id));
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <Link href="/progress" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors mb-4 sm:mb-0">
            ← Back to Progress
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text font-poppins">Your Achievements</h1>
          
          <div className="hidden sm:block">
            {/* Spacer for alignment */}
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-lg">
                <span className="font-bold text-cyan-300">{unlockedCount}</span> of <span className="opacity-80">{totalCount}</span> achievements unlocked
              </p>
              <div className="w-full sm:w-64 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="mr-3 text-sm font-medium">
                {showOnlyUnlocked ? 'Showing unlocked' : 'Showing all'}
              </span>
              <button 
                onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  showOnlyUnlocked ? 'bg-cyan-500' : 'bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showOnlyUnlocked ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {Object.keys(achievementsByType).length === 0 ? (
          <div className="glass-card p-8 rounded-xl text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold gradient-text mb-6">
              {showOnlyUnlocked ? 'No Achievements Unlocked Yet' : 'No Achievements Available'}
            </h2>
            <p className="mb-8 text-lg opacity-90">
              {showOnlyUnlocked 
                ? 'Keep practicing to unlock achievements and track your progress!'
                : 'There seems to be an issue loading achievements. Please try again later.'}
            </p>
            {showOnlyUnlocked && (
              <button
                onClick={() => setShowOnlyUnlocked(false)}
                className="shine-button text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Show All Achievements
              </button>
            )}
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
                          Unlocked!
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
          <Link
            href="/progress"
            className="shine-button text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 inline-block"
          >
            Back to Progress
          </Link>
        </div>
      </div>
    </div>
  );
} 