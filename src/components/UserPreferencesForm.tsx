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
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">Tell Us About Yourself</h2>
      <p className="text-gray-700 mb-6">
        This information helps us create personalized exercises that match your interests and skill level.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="age" className="block text-gray-700 font-medium mb-2">
            Age
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="5"
            max="100"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="interests" className="block text-gray-700 font-medium mb-2">
            What are your hobbies and interests?
          </label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Tell us what you enjoy doing..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select topics you're interested in:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableTopics.map(topic => (
              <div key={topic} className="flex items-center">
                <input
                  type="checkbox"
                  id={`topic-${topic}`}
                  checked={topicsOfInterest.includes(topic)}
                  onChange={() => handleTopicToggle(topic)}
                  className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`topic-${topic}`} className="text-gray-700">
                  {topic}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Difficulty Level:
          </label>
          <div className="flex space-x-4">
            {['easy', 'medium', 'hard'].map(level => (
              <div key={level} className="flex items-center">
                <input
                  type="radio"
                  id={`difficulty-${level}`}
                  name="difficulty"
                  value={level}
                  checked={difficultyLevel === level}
                  onChange={() => setDifficultyLevel(level)}
                  className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor={`difficulty-${level}`} className="text-gray-700 capitalize">
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
} 