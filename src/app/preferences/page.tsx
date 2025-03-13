'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import UserPreferencesForm from '@/components/UserPreferencesForm';
import { useEffect } from 'react';

export default function PreferencesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleComplete = () => {
    router.push('/practice');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-xl text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">Your Preferences</h1>
      <p className="text-xl text-gray-700 mb-8 text-center max-w-2xl mx-auto">
        Tell us a bit about yourself so we can create personalized exercises that match your interests and skill level.
      </p>
      
      <UserPreferencesForm onComplete={handleComplete} />
    </div>
  );
} 