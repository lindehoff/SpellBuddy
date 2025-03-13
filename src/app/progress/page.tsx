"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Progress } from '@/lib/service';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch('/api/progress');
        
        if (!response.ok) {
          throw new Error('Failed to load progress data');
        }
        
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        setError('Failed to load progress data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              ← Back to Home
            </Link>
            
            <h1 className="text-3xl font-bold text-indigo-700">
              Your Progress
            </h1>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            ← Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-indigo-700">
            Your Progress
          </h1>
        </div>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 font-medium">
            {error}
          </div>
        ) : progress ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
            <div className="p-6 bg-indigo-600 text-white">
              <h2 className="text-2xl font-bold mb-2">Progress Summary</h2>
              <p className="text-lg">{progress.summary}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-indigo-700">Your Strengths</h3>
                <p className="text-gray-800">{progress.strengths}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-indigo-700">Areas to Focus On</h3>
                <p className="text-gray-800">{progress.challenges}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-indigo-700">Helpful Tips</h3>
                <ul className="list-disc pl-5 text-gray-800 space-y-2">
                  {progress.tips.map((tip, index) => (
                    <li key={index} className="font-medium">{tip}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold mb-2 text-yellow-800">Encouragement</h3>
                <p className="text-yellow-800 font-medium">{progress.encouragement}</p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <Link
                href="/practice"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 inline-block"
              >
                Start New Practice
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-300">
            <p className="text-lg mb-6 font-medium">You haven't completed any exercises yet.</p>
            <Link
              href="/practice"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
            >
              Start Practicing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 