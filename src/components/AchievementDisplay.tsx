'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/service';

interface AchievementDisplayProps {
  achievements: Achievement[];
  level: number;
  experiencePoints: number;
  nextLevelPoints: number;
  onAchievementsSeen?: (achievementIds: number[]) => void;
}

export default function AchievementDisplay({
  achievements,
  level,
  experiencePoints,
  nextLevelPoints,
  onAchievementsSeen
}: AchievementDisplayProps) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  
  // Check for new achievements when the component mounts
  useEffect(() => {
    const newOnes = achievements.filter(a => a.isNew);
    if (newOnes.length > 0) {
      setNewAchievements(newOnes);
      setShowAchievements(true);
      
      // Mark achievements as seen if callback provided
      if (onAchievementsSeen) {
        onAchievementsSeen(newOnes.map(a => a.id));
      }
    }
  }, [achievements, onAchievementsSeen]);
  
  // Calculate experience progress percentage
  const progressPercentage = Math.min(100, Math.round((experiencePoints / nextLevelPoints) * 100));
  
  return (
    <div className="mb-8">
      {/* Level and XP Bar */}
      <div className="glass-card p-6 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
              {level}
            </div>
            <div className="ml-3">
              <span className="font-bold text-xl">Level {level}</span>
              <p className="text-sm opacity-80">Keep practicing to level up!</p>
            </div>
          </div>
          <div className="text-sm font-medium">
            {experiencePoints} / {nextLevelPoints} XP
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-5 overflow-hidden backdrop-blur-sm">
          <div 
            className="shine-button h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs opacity-80 text-right">
          {nextLevelPoints - experiencePoints} XP until next level
        </div>
      </div>
      
      {/* New Achievement Notification */}
      {showAchievements && newAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card rounded-xl max-w-md w-full p-6 animate-bounce-in my-4 max-h-[90vh] flex flex-col">
            <h3 className="text-2xl font-bold text-center mb-4 gradient-text">
              Achievement Unlocked!
            </h3>
            
            <div className="flex flex-col items-center overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {newAchievements.map((achievement) => (
                <div key={achievement.id} className="text-center mb-5 animate-float w-full">
                  <div className="text-5xl mb-2">{achievement.icon}</div>
                  <h4 className="text-xl font-bold gradient-text mb-1">{achievement.name}</h4>
                  <p className="opacity-90 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowAchievements(false)}
              className="mt-4 w-full shine-button text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
      
      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold gradient-text mb-6">Recent Achievements</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-xl glass-card ${achievement.isNew ? 'bg-white/20' : ''} text-center transition-all duration-300 hover:transform hover:scale-105`}
              >
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <h4 className="font-bold text-cyan-300 mb-2">{achievement.name}</h4>
                <p className="text-sm opacity-90">{achievement.description}</p>
                <p className="text-xs opacity-70 mt-2">
                  {new Date(achievement.unlockedAt * 1000).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => window.location.href = '/achievements'}
            className="mt-6 w-full bg-white/10 hover:bg-white/20 font-medium py-3 px-4 rounded-lg transition-all duration-300"
          >
            View All Achievements
          </button>
        </div>
      )}
    </div>
  );
}

// Add this to your global CSS or as a styled component
// const styles = `
// @keyframes bounceIn {
//   from, 20%, 40%, 60%, 80%, to {
//     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
//   }
//   0% {
//     opacity: 0;
// ...
// `; 