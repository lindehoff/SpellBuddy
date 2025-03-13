'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface UserPreferencesFormProps {
  onComplete: () => void;
}

export default function UserPreferencesForm({ onComplete }: UserPreferencesFormProps) {
  const { user, updateUserPreferences } = useAuth();
  const [age, setAge] = useState<string>('');
  const [interests, setInterests] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState<string>('medium');
  const [topicsOfInterest, setTopicsOfInterest] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch existing preferences if available
  useEffect(() => {
    async function fetchPreferences() {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.age) setAge(data.age.toString());
          if (data.interests) setInterests(data.interests);
          if (data.difficultyLevel) setDifficultyLevel(data.difficultyLevel);
          if (data.topicsOfInterest) {
            // Handle both string and array formats
            const topics = typeof data.topicsOfInterest === 'string' 
              ? data.topicsOfInterest.split(',') 
              : data.topicsOfInterest;
            setTopicsOfInterest(topics);
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    }
    
    fetchPreferences();
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert age to number if provided
      const ageValue = age ? parseInt(age, 10) : undefined;
      
      // Join topics array into comma-separated string
      const topicsString = topicsOfInterest.join(',');
      
      await updateUserPreferences({
        age: ageValue,
        interests,
        difficultyLevel,
        topicsOfInterest: topicsString,
      });
      
      onComplete();
    } catch (error: any) {
      setError(error.message || 'Failed to save preferences');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTopicToggle = (topic: string) => {
    setTopicsOfInterest(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };
  
  // List of potential topics
  const availableTopics = [
    'Animals', 'Sports', 'Science', 'History', 
    'Technology', 'Art', 'Music', 'Food',
    'Travel', 'Nature', 'Movies', 'Books'
  ];
  
  return (
    <div className="glass-card p-8 rounded-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold gradient-text mb-6">Tell Us About Yourself</h2>
      <p className="opacity-90 mb-6">
        This information helps us create personalized exercises that match your interests and skill level.
      </p>
      
      {error && (
        <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-6 border border-red-500/20">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="age" className="block font-medium mb-2">
            Age
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50"
            min="5"
            max="100"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="interests" className="block font-medium mb-2">
            What are your hobbies and interests?
          </label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/50"
            rows={3}
            placeholder="Tell us what you enjoy doing..."
          />
        </div>
        
        <div className="mb-6">
          <label className="block font-medium mb-3">
            Select topics you're interested in:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableTopics.map(topic => (
              <div key={topic} className="flex items-center">
                <input
                  type="checkbox"
                  id={`topic-${topic}`}
                  checked={topicsOfInterest.includes(topic)}
                  onChange={() => handleTopicToggle(topic)}
                  className="mr-2 h-5 w-5 text-cyan-400 focus:ring-cyan-400 border-white/30 rounded bg-white/10"
                />
                <label htmlFor={`topic-${topic}`} className="opacity-90">
                  {topic}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <label className="block font-medium mb-3">
            Difficulty Level:
          </label>
          <div className="flex flex-wrap gap-4">
            {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
              <div key={level} className="flex items-center">
                <input
                  type="radio"
                  id={`difficulty-${level}`}
                  name="difficulty"
                  value={level}
                  checked={difficultyLevel === level}
                  onChange={() => setDifficultyLevel(level)}
                  className="mr-2 h-5 w-5 text-cyan-400 focus:ring-cyan-400 border-white/30 bg-white/10"
                />
                <label htmlFor={`difficulty-${level}`} className="opacity-90 capitalize">
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="shine-button text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
} 