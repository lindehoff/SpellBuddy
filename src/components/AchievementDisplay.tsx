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
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
              {level}
            </div>
            <span className="ml-2 font-semibold text-gray-800">Level {level}</span>
          </div>
          <div className="text-sm text-gray-600">
            {experiencePoints} / {nextLevelPoints} XP
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* New Achievement Notification */}
      {showAchievements && newAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-bounce-in">
            <h3 className="text-2xl font-bold text-center mb-4 text-indigo-700">
              Achievement Unlocked!
            </h3>
            
            <div className="flex flex-col items-center">
              {newAchievements.map((achievement) => (
                <div key={achievement.id} className="text-center mb-4">
                  <div className="text-5xl mb-2">{achievement.icon}</div>
                  <h4 className="text-xl font-semibold text-indigo-600">{achievement.name}</h4>
                  <p className="text-gray-700">{achievement.description}</p>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowAchievements(false)}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
      
      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
          <h3 className="text-xl font-bold text-indigo-700 mb-4">Recent Achievements</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-3 rounded-lg border ${achievement.isNew ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'} text-center`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-indigo-600">{achievement.name}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(achievement.unlockedAt * 1000).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => window.location.href = '/achievements'}
            className="mt-4 w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            View All Achievements
          </button>
        </div>
      )}
    </div>
  );
}

// Add this to your global CSS or as a styled component
const styles = `
@keyframes bounceIn {
  from, 20%, 40%, 60%, 80%, to {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  20% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  40% {
    transform: scale3d(0.9, 0.9, 0.9);
  }
  60% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  80% {
    transform: scale3d(0.97, 0.97, 0.97);
  }
  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}
.animate-bounce-in {
  animation: bounceIn 0.75s;
}
`; 